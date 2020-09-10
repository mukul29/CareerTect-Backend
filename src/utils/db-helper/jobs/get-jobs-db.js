const { pool } = require("../db-helper");
const databaseAccessParameters = require("../../../values/database-access-parameters");

const LOG_TAG = "[get-jobs-db] ";

// TODO: Remove redundant code

const defaultDisplayFilter = {
    title: true,
    description: true,
    postedBy: true,
};

/**
 * Returns the list of jobs in retVal.rows
 * @param {Object} displayFilter
 * @param {Boolean} displayFilter.title return the title of the job
 * @param {Boolean} displayFilter.description return job description
 * @param {Boolean} displayFilter.postedBy return id of the current user posting the job
 * @param {Object} config
 * @param {String|undefined} config.jobId id of the job to be searched
 * @param {Number} config.itemsPerPage number of items to return
 * @param {Number} config.page page number
 * @param {*} poolType (optional) pool/client initialized with transaction to execute as single query or part of a transaction
 */
const getJobsDB = async (
    displayFilter = { ...defaultDisplayFilter },
    config = {
        jobId: undefined,
        itemsPerPage: databaseAccessParameters.itemsPerPage,
        page: 1,
    },
    poolType = pool
) => {
    const queryToRun = `SELECT JOB_ID
        ${displayFilter.title ? ", Title" : ""}
        ${displayFilter.description ? ", DESCRIPTION" : ""}
        ${displayFilter.postedBy ? ", POSTED_BY" : ""}
        FROM JOB_PORTAL.JOBS
        ${config.jobId ? "WHERE JOB_ID=$1" : ""}
        LIMIT ${config.itemsPerPage} OFFSET ${(config.page - 1) * config.itemsPerPage}`;

    console.log(LOG_TAG, queryToRun);

    try {
        const result = await poolType.query(
            queryToRun,
            config.jobId ? [config.jobId] : undefined
        );
        return result;
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
};

/**
 * Returns the list of jobs in retVal.rows
 * @param {String} recruiterId id of the recruiter
 * @param {Object} displayFilter
 * @param {Boolean} displayFilter.title return the title of the job
 * @param {Boolean} displayFilter.description return job description
 * @param {Boolean} displayFilter.postedBy return id of the current user posting the job
 * @param {Object} config
 * @param {Number} config.itemsPerPage number of items to return
 * @param {Number} config.page page number
 * @param {*} poolType (optional) pool/client initialized with transaction to execute as single query or part of a transaction
 */
const getPostedJobsDB = async (
    recruiterId,
    displayFilter = { ...defaultDisplayFilter },
    config = {
        itemsPerPage: databaseAccessParameters.itemsPerPage,
        page: 1,
    },
    poolType = pool
) => {
    const queryToRun = `SELECT JOB_ID
        ${displayFilter.title ? ", Title" : ""}
        ${displayFilter.description ? ", DESCRIPTION" : ""}
        ${displayFilter.postedBy ? ", POSTED_BY" : ""}
        FROM JOB_PORTAL.JOBS
        WHERE POSTED_BY=$1
        LIMIT ${config.itemsPerPage} OFFSET ${(config.page - 1) * config.itemsPerPage}`;

    console.log(LOG_TAG, queryToRun);

    try {
        const result = await poolType.query(queryToRun, [recruiterId]);
        return result;
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
};

/**
 * Returns a single job by id
 * @param {Number} jobId id of the job to be search
 * @param {Object} displayFilter
 * @param {Boolean} displayFilter.title return the title of the job
 * @param {Boolean} displayFilter.description return job description
 * @param {Boolean} displayFilter.postedBy return id of the current user posting the job
 * @param {*} poolType (optional) pool/client initialized with transaction to execute as single query or part of a transaction
 */
const getJobByIdDB = async (
    jobId,
    displayFilter = {...defaultDisplayFilter},
    poolType = pool
) => {
    try {
        const result = await getJobsDB(displayFilter, {jobId, itemsPerPage: 1, page: 1}, poolType);
        return result;
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
};

/**
 * Returns the list of jobs in retVal.rows
 * @param {Object} displayFilter
 * @param {Boolean} displayFilter.title return the title of the job
 * @param {Boolean} displayFilter.description return job description
 * @param {Boolean} displayFilter.postedBy return id of the current user posting the job
 * @param {Object} config
 * @param {Number} config.itemsPerPage number of items to return
 * @param {Number} config.page page number
 * @param {*} poolType (optional) pool/client initialized with transaction to execute as single query or part of a transaction
 */
const getAppliedJobsDB = async (
    seekerId,
    displayFilter = {...defaultDisplayFilter},
    config = {
        itemsPerPage: databaseAccessParameters.itemsPerPage,
        page: 1,
    },
    poolType = pool
) => {
    const queryToRun = `SELECT J.JOB_ID, A.APPLICANT_ID
        ${displayFilter.title ? ", J.Title" : ""}
        ${displayFilter.description ? ", J.DESCRIPTION" : ""}
        ${displayFilter.postedBy ? ", J.POSTED_BY" : ""}
        FROM JOB_PORTAL.JOBS as J, JOB_PORTAL.JOBS_APPLICANTS as A
        WHERE J.JOB_ID=A.JOB_ID and A.APPLICANT_ID=$1
        LIMIT ${config.itemsPerPage} OFFSET ${(config.page - 1) * config.itemsPerPage}`;

    try {
        const result = await poolType.query(queryToRun, [seekerId]);
        return result;
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
};


/**
 * Returns the list of jobs in retVal.rows
 * @param {Number} jobId
 * @param {Object} config
 * @param {Number} config.itemsPerPage number of items to return
 * @param {Number} config.page page number
 * @param {*} poolType (optional) pool/client initialized with transaction to execute as single query or part of a transaction
 */
const getApplicantsByJobIdDB = async (
    jobId,
    config = {
        itemsPerPage: databaseAccessParameters.itemsPerPage,
        page: 1,
    },
    poolType = pool
) => {

    const queryToRun = `SELECT A.APPLICANT_ID, U.FULLNAME, U.EMAIL
        FROM JOB_PORTAL.JOBS as J, JOB_PORTAL.JOBS_APPLICANTS as A, JOB_PORTAL.USERS as U
        WHERE J.JOB_ID=A.JOB_ID and A.APPLICANT_ID=U.USER_ID and J.JOB_ID=$1
        LIMIT ${config.itemsPerPage} OFFSET ${(config.page - 1) * config.itemsPerPage}`;

    try {
        const result = await poolType.query(queryToRun, [parseInt(jobId)]);
        return result;
    } catch (err) {
        console.log(LOG_TAG, err);
        throw err;
    }
};

exports.getJobsDB = getJobsDB;
exports.getJobByIdDB = getJobByIdDB;
exports.getPostedJobsDB = getPostedJobsDB;
exports.getAppliedJobsDB = getAppliedJobsDB;
exports.getApplicantsByJobIdDB = getApplicantsByJobIdDB;
