if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { Pool } = require('pg');
const LOG_TAG = "[db-helper] ";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? true : false
});

/**
 * call this higher order function as withTransaction(myFunction)(argumentsToMyFunction)
 * @param {Function} dbActions function performing tasks which need to be wrapped in a transaction
 * @return return value of the function passed
 */
const withTransaction = (dbActions) => {
    return async (...arguments) => {
        let client;
        try {
            client = await pool.connect();
        } catch (err) {
            client.release();
            console.log(LOG_TAG, "Could not get connection pool");
            throw new Error(err);
        }

        try {
            await client.query('BEGIN');
            console.log(LOG_TAG, "Begin transaction");
            const result = await dbActions(arguments, client);
            console.log(LOG_TAG, "About to commit transaction.");
            await client.query('COMMIT');
            console.log(LOG_TAG, "Committed transaction");
            if (result != null) {
                return result;
            }
        } catch (err) {
            console.log(LOG_TAG, err);
            try {
                console.log(LOG_TAG, "Initiating rollback");
                await client.query('ROLLBACk');
                console.log(LOG_TAG, "Rollback finished");
            } catch (err) {
                console.log(LOG_TAG, "Could not roll back");
                console.log(LOG_TAG, err);
            }
            throw new Error(err);
        } finally {
            client.release();
        }
    }
}

exports.pool = pool;
exports.withTransaction = withTransaction;