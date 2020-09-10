const { pool } = require("../db-helper");

const LOG_TAG = "[apply-job-db] "

/**
 * 
 * @param {Number} jobId id of the job being applied to
 * @param {Number} seekerId id of the user
 */
const applyToJobDB = async ({jobId, seekerId}, poolType = pool) => {
    try {
        const result = await poolType.query(
            'INSERT INTO JOB_PORTAL.JOBS_APPLICANTS (JOB_ID, APPLICANT_ID) values ($1, $2)',
            [jobId, seekerId]
        );
        return result;
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
}

module.exports = applyToJobDB;