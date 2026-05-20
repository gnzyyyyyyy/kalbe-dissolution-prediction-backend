const DatasetReport = require("../models/DatasetReport");
const Dataset = require("../models/Dataset");
const logActivity = require("../utils/logActivity");

// CREATE DATASET REPORT
exports.createDatasetReport = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "PDF report is required"
            });
        }

        const {
            datasetId,
            predictionId,
            datasetName,
            predictionResult
        } = req.body;

        // FIND DATASET
        const dataset = await Dataset.findById(datasetId);

        if (!dataset) {
            return res.status(404).json({
                message: "Dataset not found"
            });
        }

        // CREATE REPORT
        const report = await DatasetReport.create({

            dataSetId: datasetId,

            predictionId,

            datasetName,

            uploadedBy: req.user.username,

            // TAKE FROM DATASET TABLE
            uploadedOn: dataset.uploadTime,

            predictionResult,

            reportCreatedBy: req.user.username,

            reportPath: `/reports/${req.file.filename}`
        });

        await logActivity(
            "CREATE_DATASET_REPORT",
            `Created report for ${datasetName}`,
            req.user
        );

        res.status(201).json({
            message: "Dataset report created successfully",
            report
        });

    } catch (error) {

        res.status(500).json({
            message: "Error creating dataset report",
            error: error.message
        });
    }
};

// GET REPORTS
exports.getDatasetReports = async (req, res) => {

    try {

        const reports = await DatasetReport.find({
            statusReport: "Active"
        }).sort({
            createdAt: -1
        });

        res.json({
            count: reports.length,
            data: reports
        });

    } catch (error) {

        res.status(500).json({
            message: "Error fetching reports",
            error: error.message
        });
    }
};

// ARCHIVE REPORT
exports.updateDatasetReport = async (req, res) => {

    try {

        const report = await DatasetReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                message: "Dataset report not found"
            });
        }

        report.statusReport = "Archived";

        await report.save();

        await logActivity(
            "ARCHIVE_DATASET_REPORT",
            `Archived report for dataset ${report.datasetName}`,
            req.user
        );

        res.json({
            message: "Dataset report archived"
        });

    } catch (error) {

        res.status(500).json({
            message: "Error updating report",
            error: error.message
        });
    }
};

// GET ARCHIVED REPORTS
exports.getArchivedDatasetReports = async (req, res) => {

    try {

        const reports = await DatasetReport.find({
            statusReport: "Archived"
        }).sort({
            createdAt: -1
        });

        res.json({
            count: reports.length,
            data: reports
        });

    } catch (error) {

        res.status(500).json({
            message: "Error fetching reports",
            error: error.message
        });
    }
};

// REACTIVATE REPORT
exports.reactivateDatasetReport = async (req, res) => {

    try {

        const report = await DatasetReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                message: "Dataset report not found"
            });
        }

        report.statusReport = "Active";

        await report.save();

        await logActivity(
            "REACTIVATE_DATASET_REPORT",
            `Reactivate report for dataset ${report.datasetName}`,
            req.user
        );

        res.json({
            message: "Dataset report reactivated"
        });

    } catch (error) {

        res.status(500).json({
            message: "Error updating report",
            error: error.message
        });
    }
};