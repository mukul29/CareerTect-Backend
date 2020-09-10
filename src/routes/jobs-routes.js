const express = require("express");
const { check } = require("express-validator");

const {
    addJob,
    getAllJobs,
    applyToJob,
    getJobById,
    getAppliedJobs,
    getPostedJobs,
    acceptSeekersApplication,
    rejectSeekersApplication,
    getApplicantsByJobId,
} = require("../controllers/jobs-controllers");

const checkAuth = require("../middlewares/check-auth");

const router = express.Router();

router.use(checkAuth);

// Routes that require you to be authenticated below this comment
router.get("/", getAllJobs);
// get jobs applied to
router.get("/applied", getAppliedJobs);
router.get("/posted", getPostedJobs);

router.get("/:jobId", getJobById);
// apply to a job
router.post("/:jobId", applyToJob);

// accept or reject application
router.get("/:jobId/applicants", getApplicantsByJobId);
router.post("/:jobId/accept", acceptSeekersApplication);
router.post("/:jobId/reject", rejectSeekersApplication);

router.post(
    "/",
    [check("title").trim().notEmpty(), check("description").trim().notEmpty()],
    addJob
);

module.exports = router;
