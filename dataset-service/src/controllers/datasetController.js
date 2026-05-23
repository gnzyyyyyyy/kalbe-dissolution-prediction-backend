const fs = require("fs")
const path = require("path")

const Dataset = require("../models/Dataset")
const logActivity = require("../utils/logActivity")
const { validateFile } = require("../utils/fileValidator")

// UPLOAD DATASET 
exports.uploadDataset = async (req, res) => {
    try {
        const allowedFile = [".xls", ".xlsx"];

        const file = req.file;

        if (!file) {

            await logActivity(
                "UPLOAD_DATASET_FAILED",
                "Upload dataset failed: No file uploaded",
                req.user
            );
            
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        const ext = path.extname(file.originalname).toLowerCase();

        // Only .xls and .xlsx files are allowed
        if (!allowedFile.includes(ext)) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            await logActivity(
                "UPLOAD_DATASET_FAILED",
                `Upload dataset failed: Invalid file type (${file.originalname})`,
                req.user
            );

            return res.status(400).json({
                message: "Invalid file type, only XLS and XLSX files are allowed"
            })
        }

        // validate file content
        let data;
        try {
            data = await validateFile(file.path);
        } catch (error) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            await logActivity(
                "UPLOAD_DATASET_FAILED",
                `Upload dataset failed: ${error.message}`,
                req.user
            );

            return res.status(400).json({
                message: error.message
            });
        }

        if (!data || data.length === 0) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            await logActivity(
                "UPLOAD_DATASET_FAILED",
                "Upload dataset failed: Dataset is empty or invalid",
                req.user
            );

            return res.status(400).json({
                message: "Dataset is empty or invalid"
            });
        }

        // Get the total number of rows
        const totalRows = data.length;

        const totalBatch = Math.ceil(totalRows / 36);

        const dataset = await Dataset.create({
            fileName: file.filename,
            originalName: file.originalname,
            filePath: file.path,
            fileSize: file.size,
            rowCount: data.length,
            uploadedBy: req.user.id,
            uploadedByUsername: req.user.username
        });

        await logActivity(
            "UPLOAD_DATASET",
            `Uploaded dataset ${dataset.originalName}`,
            req.user
        );

        res.status(201).json({
            message: "File uploaded successfully",
            dataset,
            totalBatch
        });

    } catch (error) {
        await logActivity(
            "UPLOAD_DATASET_FAILED",
            `Upload dataset failed: ${error.message}`,
            req.user
        )
        console.log(error);
        res.status(500).json({
            message: "Error uploading dataset",
            error: error.message
        });
    }
};

// GET ALL ACTIVE DATASETS
exports.getDatasets = async (req, res) => {
    try{
        // Take from frontend
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Sort
        const sort = req.query.sort === "asc" ? 1 : -1;

        // Only active datasets
        const query = {statusDataset: "Active"};

        // Pagination
        const skip = (page - 1) * limit;

        // Take total query
        const total = await Dataset.countDocuments(query);

        const datasets = await Dataset
            .find(query)
            .sort({uploadTime: sort})
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            page,
            totalPage: Math.ceil(total / limit),
            totalData: total,
            datasets
        })
    } catch (error) {
        await logActivity(
            "GET_DATASETS_FAILED",
            `Get datasets failed: ${error.message}`,
            req.user
        )
        res.status(500).json({
            message: "Error getting datasets",
            error: error.message
        })
    }
}

// GET DATASET BY ID
exports.getDatasetById = async (req, res) => {
    try{
        const dataset = await Dataset.findById(req.params.id)
        if(!dataset) {
            await logActivity(
                "GET_DATASET_BY_ID_FAILED",
                `Failed to get dataset: Dataset not found with id ${req.params.id}`,
                req.user
            )
            return res.status(404).json({
                message: "Dataset not found"
            })
        }

        res.status(200).json(dataset)
    } catch (error) {
        await logActivity(
            "GET_DATASET_BY_ID_FAILED",
            `Get dataset failed: ${error.message}`,
            req.user
        )
        res.status(500).json({
            message: "Error getting dataset",
            error: error.message
        })
    }
}

// UPDATE DATASET
exports.updateDataset = async (req, res) => {
    try{
        const dataset = await Dataset.findById(req.params.id)
        if(!dataset) {
            await logActivity(
                "UPDATE_DATASET_FAILED",
                `Failed to update dataset: Dataset not found with id ${req.params.id}`,
                req.user
            )
            return res.status(404).json({
                message: "Dataset not found"
            })
        }

        await dataset.updateOne(req.body)

        await logActivity(
            "UPDATE_DATASET",
            `Updated dataset ${dataset.originalName}`,
            req.user
        )
        res.status(200).json({
            message: "Dataset updated successfully"
        })
    } catch (error) {
        await logActivity(
            "UPDATE_DATASET_FAILED",
            `Update dataset failed: ${error.message}`,
            req.user
        )
        res.status(500).json({
            message: "Error updating dataset",
            error: error.message
        })
    }
}

// ARCHIVE DATASET
exports.archiveDataset = async (req, res) => {
    try {
        const dataset = await Dataset.findById(req.params.id);

        if (!dataset) {
            await logActivity(
                "ARCHIVE_DATASET_FAILED",
                `Failed to archive dataset: Dataset not found with id ${req.params.id}`,
                req.user
            )
            return res.status(404).json({
                message: "Dataset not found",
            });
        }

        await dataset.updateOne({ statusDataset: "Archived" });

        await logActivity(
            "ARCHIVE_DATASET",
            `Archived dataset ${dataset.originalName}`,
            req.user
        );

        res.status(200).json({
            message: "Dataset archived successfully",
        });
    } catch (error) {
        await logActivity(
            "ARCHIVE_DATASET_FAILED",
            `Archive dataset failed: ${error.message}`,
            req.user
        )
        res.status(500).json({
            message: "Error archiving dataset",
            error: error.message,
        });
    }
}

// GET ALL ARCHIVED DATASET
exports.getArchivedDatasets = async (req, res) => {
    try {
        // Take from frontend
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 10);

        // Sort
        const sort = req.query.sort === "asc" ? 1 : -1;

        // Only active datasets
        const query = {statusDataset: "Archived"};

        // Pagination
        const skip = (page - 1) * limit;

        // Take total query
        const total = await Dataset.countDocuments(query);

        const datasets = await Dataset
            .find(query)
            .sort({uploadTime: sort})
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            page,
            totalPage: Math.ceil(total / limit),
            totalData: total,
            datasets
        })
    } catch (error) {
        await logActivity(
            "GET_ARCHIVED_DATASETS_FAILED",
            `Get archived datasets failed: ${error.message}`,
            req.user
        )
        res.status(500).json({
            message: "Error getting archived datasets",
            error: error.message,
        });
    }
}

// ACTIVATE DATASET
exports.activateDataset = async (req, res) => {
    try {
        // Get dataset based on id
        const dataset = await Dataset.findById(req.params.id);

        if (!dataset) {
            await logActivity(
                "ACTIVATE_DATASET_FAILED",
                `Failed to activate dataset: Dataset not found with id ${req.params.id}`,
                req.user
            )
            return res.status(404).json({
                message: "Dataset not found",
            });
        }

        await dataset.updateOne({ statusDataset: "Active" });

        await logActivity(
            "ACTIVATE_DATASET",
            `Archived dataset ${dataset.originalName}`,
            req.user
        );

        res.status(200).json({
            message: "Dataset archived successfully",
        });
    } catch (error) {
        await logActivity(
            "ACTIVATE_DATASET_FAILED",
            `Activate dataset failed: ${error.message}`,
            req.user
        )
        res.status(500).json({
            message: "Error archiving dataset",
            error: error.message,
        });
    }
}

// DELETE DATASET
exports.deleteDataset = async (req, res) => {
    try{
        const dataset = await Dataset.findById(req.params.id)
        if(!dataset) {
            await logActivity(
                "DELETE_DATASET_FAILED",
                `Failed to delete dataset: Dataset not found with id ${req.params.id}`,
                req.user
            )
            return res.status(404).json({
                message: "Dataset not found"
            })
        }

        const filepath = path.join(__dirname, "../..", dataset.filePath)
        if(fs.existsSync(filepath)) {
            fs.unlinkSync(filepath)
        }

        await dataset.deleteOne()

        await logActivity(
            "DELETE_DATASET",
            `Deleted dataset ${dataset.originalName}`,
            req.user
        )
        res.status(200).json({
            message: "Dataset deleted successfully"
        })
    } catch (error) {
        await logActivity(
            "DELETE_DATASET_FAILED",
            `Delete dataset failed: ${error.message}`,
            req.user
        )
        res.status(500).json({
            message: "Error deleting dataset",
            error: error.message
        })
    }
};