const { pool } = require("../db-helper");

const LOG_TAG = "[get-user-by-email-db] "

/**
 * 
 * @param {String} email email of the user to be searched
 * @param {Object} config get other fields besides user_id
 * @param {Boolean} config.password whether password should be returned or not
 * @param {Boolean} config.type whether type should be returned or not
 * @param {*} poolType (optional) pool/client initialized with transaction to execute as single query or part of a transaction
 */
const getUserByEmailDB = async (email, config = { password: false, type: false }, poolType = pool) => {
    const queryToRun = `SELECT USER_ID${config.password ? ', PASSWORD' : ""}${config.type ? ', TYPE' : ""} FROM JOB_PORTAL.USERS WHERE EMAIL = $1`;
    try {
        const result = await poolType.query(
            queryToRun,
            [email]
        )
        return result;
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
}

module.exports = getUserByEmailDB;