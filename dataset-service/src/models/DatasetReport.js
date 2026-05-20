const mongoose = require("mongoose");

const datasetReportSchema = new mongoose.Schema({
    dataSetId: {
        type: String,   // was ObjectId
        required: true
    },

    predictionId: {
        type: String,
        default: null
    },

    datasetName: String,

    uploadedBy: {
        type: String,
        required: true
    },

    uploadedOn: {
        type: Date,
        required: true
    },

    predictionResult: {
        type: String,
        default: "-"
    },

    reportPath: {
        type: String,
        default: null
    },

    reportCreatedBy: {
        type: String,
        default: null
    },

    statusReport: {
        type: String,
        enum: ["Archived", "Active"],
        default: "Active"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("DatasetReport", datasetReportSchema);