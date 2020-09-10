const { pool } = require("../db-helper");

const LOG_TAG = "[accept-application-db] "

/**
 * Take action against a seeker's application
 * @param {Object} param0
 * @param {Number} param0.jobId id of the job being applied to
 * @param {Number} param0.seekerId id of the user
 */
const takeActionApplicationDB = async ({ jobId, seekerId, action=false }, poolType = pool) => {
    try {
        const result = await poolType.query(
            'UPDATE JOB_PORTAL.JOBS_APPLICANTS SET ACCEPTED=$1 WHERE JOB_ID=$2 and APPLICANT_ID=$3',
            [action, jobId, seekerId]
        );
        return result;
    } catch (err) {
        throw err;
    }
}

/**
 * Accept the a seeker's application
 * @param {Object} param0
 * @param {Number} param0.jobId id of the job being applied to
 * @param {Number} param0.seekerId id of the user
 */
const acceptApplicationDB = async ({ jobId, seekerId }, poolType = pool) => {
    try {
        const result = await takeActionApplicationDB({jobId, seekerId, action: true}, pool); 
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
}


/**
 * Deny the a seeker's application
 * @param {Object} param0
 * @param {Number} param0.jobId id of the job being applied to
 * @param {Number} param0.seekerId id of the user
 */
const rejectApplicationDB = async ({ jobId, seekerId }, poolType = pool) => {
    try {
        const result = await takeActionApplicationDB({jobId, seekerId, action: false}, pool); 
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
}

exports.acceptApplicationDB = acceptApplicationDB;
exports.rejectApplicationDB = rejectApplicationDB;