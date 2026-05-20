const express = require("express");
const router = express.Router();

const {
    getDatasetReports,
    updateDatasetReport,
    createDatasetReport,
    reactivateDatasetReport,
    getArchivedDatasetReports
} = require("../controllers/datasetReportController");

const uploadReport = require("../middleware/reportUploadMiddleware");

const { verifyToken } = require("../middleware/authMiddleware");

router.post(
    "/upload",
    verifyToken,
    uploadReport.single("report"),
    createDatasetReport
);

router.get("/", verifyToken, getDatasetReports);

router.get("/archived", verifyToken, getArchivedDatasetReports);

router.put("/archive/:id", verifyToken, updateDatasetReport);

router.put("/activate/:id", verifyToken, reactivateDatasetReport);

module.exports = router;