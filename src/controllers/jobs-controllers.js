const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

const {
    createJobDB,
    getJobsDB,
    applyJobDB,
    getJobByIdDB,
    getAppliedJobsDB,
    getPostedJobsDB,
    acceptApplicationDB,
    rejectApplicationDB,
    getApplicantsByJobIdDB
} = require("../utils/db-helper/jobs");

const { RECRUITER, SEEKER } = require("../values/user-types");
const databaseAccessParameters = require("../values/database-access-parameters");

const LOG_TAG = "[jobs-controllers] ";

// TODO: add controller for recruiter to take action (accept or reject)

const addJob = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs passed, please check your data.", 422));
    }

    if (parseInt(res.locals.userType) !== RECRUITER) {
        return next(new HttpError("You are not authorized. Not a recruiter.", 403));
    }

    const { title, description } = req.body;

    let result;
    try {
        result = await createJobDB({
            title: title,
            description: description,
            postedBy: res.locals.userId,
        });
    } catch (err) {
        console.log(LOG_TAG, err);
        return next(new HttpError("Something went wrong. Could not create job.", 500));
    }

    res.status(201).json({ createdId: result.rows[0].job_id });
};

const getAllJobs = async (req, res, next) => {
    // if (res.locals.userType !== SEEKER) {
    //     return next(new HttpError("You are not authorized. Only accessible by a seeker.", 403));
    // }

    const itemsPerPage = req.query.page_size || databaseAccessParameters.itemsPerPage;
    const page = req.query.page || 1;

    let result;
    try {
        result = await getJobsDB(
            undefined,
            (config = { itemsPerPage: itemsPerPage, page: page })
        );
    } catch (err) {
        console.log(LOG_TAG, err);
        return next(new HttpError("Something went wrong. Could not get jobs.", 500));
    }
    res.json({ jobs: result.rows });
};

const applyToJob = async (req, res, next) => {
    let result;
    const jobId = req.params.jobId;
    if (res.locals.userType !== SEEKER) {
        return next(new HttpError("You are not authorized.", 403));
    }
    try {
        result = await applyJobDB({ jobId: jobId, seekerId: res.locals.userId });
    } catch (err) {
        console.log(LOG_TAG, err);
        return next(new HttpError("Something went wrong. Could not apply to job", 500));
    }

    res.status(200).json({ message: "Applied successfully." });
};

const getJobById = async (req, res, next) => {
    const jobId = req.params.jobId;

    let result;
    try {
        result = await getJobByIdDB(jobId);
    } catch (err) {
        return next(new HttpError("Something went wrong, could not get job by id.", 500));
    }

    if (result.rowCount < 1) {
        return next(new HttpError("Invalid job id.", 404));
    }

    res.status(200).json({ job: result.rows[0] });
};

const getAppliedJobs = async (req, res, next) => {
    if (res.locals.userType !== SEEKER) {
        return next(
            new HttpError("You are not authorized. Only accessible by a seeker.", 403)
        );
    }
    const userId = res.locals.userId;

    const itemsPerPage = req.query.page_size || databaseAccessParameters.itemsPerPage;
    const page = req.query.page || 1;

    let result;
    try {
        result = await getAppliedJobsDB(
            (seekerId = userId),
            undefined,
            (config = { itemsPerPage, page })
        );
    } catch (err) {
        console.log(LOG_TAG, err);
        return next(
            new HttpError("Something went wrong, could not get applied jobs", 500)
        );
    }

    // TODO: handle pagination overflow and uncomment the following
    // if (result.rowCount === 0) {
    //     return next(new HttpError("You have not applied to any jobs yet.", 404));
    // }
    res.status(200).json({ jobs: result.rows });
};

const getPostedJobs = async (req, res, next) => {
    if (res.locals.userType !== RECRUITER) {
        return next(
            new HttpError("You are not authorized. Only accessible by a recruiter.", 403)
        );
    }
    const userId = res.locals.userId;
    const itemsPerPage = req.query.page_size || databaseAccessParameters.itemsPerPage;
    const page = req.query.page || 1;

    let result;
    try {
        result = await getPostedJobsDB(
            userId,
            undefined,
            (displayFilter = { itemsPerPage: itemsPerPage, page: page })
        );
    } catch (err) {
        console.log(LOG_TAG, err);
        return next(
            new HttpError("Something went wrong, could not get posted jobs", 500)
        );
    }

    // TODO: handle pagination overflow and uncomment the following
    // if (result.rowCount === 0) {
    //     return next(new HttpError("You have posted any jobs yet.", 404));
    // }
    res.status(200).json({ jobs: result.rows });
};

const acceptSeekersApplication = async (req, res, next) => {
    if (res.locals.userType !== RECRUITER) {
        return next(
            new HttpError("You are not authorized. Only accessible by a recruiter.", 403)
        );
    }

    const recruiterId = res.locals.userId;
    const { seekerId } = req.body;
    const jobId = req.params.jobId;
    console.log(jobId, seekerId);

    try {
        const result = await getJobByIdDB(jobId, { postedBy: true });
        if (result.rows[0].posted_by !== recruiterId) {
            return next(
                new HttpError(
                    "You are not authorized. This job was posted by another recruiter.",
                    403
                )
            );
        }

        await acceptApplicationDB({ jobId, seekerId });
    } catch {
        console.log(LOG_TAG, err);
        return next(
            new HttpError("Something went wrong, could not accept application", 403)
        );
    }

    res.status(200).json({ message: "Application accepted" });
};

const rejectSeekersApplication = async (req, res, next) => {
    if (res.locals.userType !== RECRUITER) {
        return next(
            new HttpError("You are not authorized. Only accessible by a recruiter.", 403)
        );
    }

    const recruiterId = res.locals.userId;
    const { seekerId } = req.body;
    const jobId = req.params.jobId;

    try {
        const result = await getJobByIdDB(jobId, { postedBy: true });
        if (result.rows[0].posted_by !== recruiterId) {
            return next(
                new HttpError(
                    "You are not authorized. This job was posted by another recruiter.",
                    403
                )
            );
        }

        await rejectApplicationDB({ jobId, seekerId });
    } catch {
        console.log(LOG_TAG, err);
        return next(
            new HttpError("Something went wrong, could not accept application", 403)
        );
    }

    res.status(200).json({ message: "Application accepted" });
};

const getApplicantsByJobId = async (req, res, next) => {
    if (res.locals.userType !== RECRUITER) {
        return next(
            new HttpError("You are not authorized. Only accessible by a recruiter.", 403)
        );
    }

    const recruiterId = res.locals.userId;
    const jobId = req.params.jobId;
    let applicantsResult;
    try {
        const result = await getJobByIdDB(jobId, { postedBy: true });
        if (result.rows[0].posted_by !== recruiterId) {
            return next(
                new HttpError(
                    "You are not authorized. This job was posted by another recruiter.",
                    403
                )
            );
        }

        applicantsResult = await getApplicantsByJobIdDB( jobId );
    } catch (err) {
        console.log(LOG_TAG, err);
        return next(
            new HttpError("Something went wrong, could not accept application", 403)
        );
    }

    res.status(200).json({ applicants: applicantsResult.rows });
};

exports.addJob = addJob;
exports.getAllJobs = getAllJobs;
exports.applyToJob = applyToJob;
exports.getJobById = getJobById;
exports.getAppliedJobs = getAppliedJobs;
exports.getPostedJobs = getPostedJobs;
exports.acceptSeekersApplication = acceptSeekersApplication;
exports.rejectSeekersApplication = rejectSeekersApplication;
exports.getApplicantsByJobId = getApplicantsByJobId;
