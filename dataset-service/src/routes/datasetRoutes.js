const express = require("express");
const router = express.Router();

const datasetController = require("../controllers/datasetController");
const upload = require("../middleware/uploadMiddleware");
const { verifyToken } = require("../middleware/authMiddleware");
const logActivity = require("../utils/logActivity");

router.post(
    "/upload",
    verifyToken,
    (req, res, next) => {
        upload.single("dataset")(req, res, async (err) => {
            if (err) {

                await logActivity(
                    "UPLOAD_DATASET_FAILED",
                    `Upload dataset failed: ${err.message}`,
                    req.user
                )
                return res.status(400).json({
                    message: err.message
                });
            }
            next();
        });
    },
    datasetController.uploadDataset
);

router.get("/", verifyToken, datasetController.getDatasets);
router.get("/archived", verifyToken, datasetController.getArchivedDatasets);
router.put("/activate/:id", verifyToken, datasetController.activateDataset);
router.put("/archive/:id", verifyToken, datasetController.archiveDataset);
router.get("/:id", verifyToken, datasetController.getDatasetById);
router.put("/:id", verifyToken, datasetController.updateDataset);
router.delete("/:id", verifyToken, datasetController.deleteDataset);

module.exports = router;