const { pool } = require("../db-helper");

const LOG_TAG = "[create-seeker-db] "

/**
 * 
 * @param {Object} userData
 * @param {Number} userData.seekerId id of the seeker to be created
 * @param {*} poolType (optional) pool/client initialized with transaction to execute as single query or part of a transaction
 */
const createSeekerDB = async ({ seekerId }, poolType = pool) => {
    console.log(LOG_TAG);

    try {
        const result = await poolType.query(
            'INSERT INTO JOB_PORTAL.SEEKER (SEEKER_ID) values ($1) RETURNING SEEKER_ID',
            [seekerId]
        );
        return result.rows[0].seeker_id;
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
}

module.exports = createSeekerDB;