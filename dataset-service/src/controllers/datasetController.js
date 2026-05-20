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

            return res.status(400).json({
                message: error.message
            });
        }

        if (!data || data.length === 0) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

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
            return res.status(404).json({
                message: "Dataset not found"
            })
        }

        res.status(200).json(dataset)
    } catch (error) {
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
        res.status(500).json({
            message: "Error deleting dataset",
            error: error.message
        })
    }
};