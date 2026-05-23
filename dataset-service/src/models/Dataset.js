const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
    },
    rowCount: {
        type: Number
    },
    uploadedBy: {
        type: String,
        required: true
    },
    uploadedByUsername: {
        type: String,
        required: true
    },
    uploadTime: {
        type: Date,
        default: Date.now
    } ,
    statusDataset: {
        type: String,
        enum: ["Active", "Archived"],
        default: "Active"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Dataset', datasetSchema);