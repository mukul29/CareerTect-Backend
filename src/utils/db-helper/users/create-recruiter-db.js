const { pool } = require("../db-helper");

const LOG_TAG = "[create-recruiter-db] "

/**
 * 
 * @param {Object} userData
 * @param {Number} userData.recruiterId id of the recruiter to be created
 * @param {*} poolType (optional) pool/client initialized with transaction to execute as single query or part of a transaction
 */
const createRecruiterDB = async ({ recruiterId }, poolType = pool) => {
    console.log(LOG_TAG);

    try {
        const result = await poolType.query(
            'INSERT INTO JOB_PORTAL.RECRUITER (RECRUITER_ID) values ($1) RETURNING RECRUITER_ID',
            [recruiterId]
        );
        return result.rows[0].recruiter_id;
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
}

module.exports = createRecruiterDB;