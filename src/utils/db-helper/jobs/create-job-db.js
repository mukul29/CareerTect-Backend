const { pool } = require("../db-helper");

const LOG_TAG = "[create-job-db] "

/**
 * 
 * @param {Object} jobData
 * @param {String} jobData.title title of the job
 * @param {String} jobData.description job description
 * @param {String} jobData.postedBy id of the current user posting the job
 * @param {*} poolType (optional) pool/client initialized with transaction to execute as single query or part of a transaction
 */
const createJobDB = async ({ title, description, postedBy }, poolType = pool) => {
    try {
        const result = await poolType.query(
            'INSERT INTO JOB_PORTAL.JOBS (TITLE, DESCRIPTION, POSTED_BY) values ($1, $2, $3) RETURNING JOB_ID',
            [title, description, postedBy]
        );
        return result;
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
}

module.exports = createJobDB;