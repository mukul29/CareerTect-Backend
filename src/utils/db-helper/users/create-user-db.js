const { pool } = require("../db-helper");

const LOG_TAG = "[create-user-db] "

/**
 * 
 * @param {Object} userData
 * @param {String} userData.fullName name of the user to be created
 * @param {String} userData.email email of the user
 * @param {String} userData.password hashed password of the user
 * @param {Number} userData.type type of the user
 * @param {*} poolType (optional) pool/client initialized with transaction to execute as single query or part of a transaction
 */
const createUserDB = async ({ fullName, email, password, type}, poolType = pool) => {
    try {
        const result = await poolType.query(
            'INSERT INTO JOB_PORTAL.USERS (FULLNAME, EMAIL, PASSWORD, TYPE) values ($1, $2, $3, $4) RETURNING USER_ID',
            [fullName, email, password, type]
        );
        return result.rows[0].user_id;
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
}

module.exports = createUserDB;