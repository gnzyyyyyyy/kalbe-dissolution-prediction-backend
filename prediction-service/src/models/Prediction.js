const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({

    datasetId: {
        type: String,
        required: true
    },

    datasetName: {
        type: String,
        required: true
    },

    generatedBy: {
        type: String,
        required: true
    },

    generatedByName: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Processing", "Completed", "Failed"],
        default: "Processing"
    },

    overallPlot: {
    type: String,
    default: null
    },

    overallResult: {
        type: Array,
        default: []
    },

    batchPlots: {
        type: Object,
        default: {}
    },

    perBatch: {
        type: Object,
        default: {}
    },

    perSample: {
        type: Object,
        default: {}
    },

    predictionFolder: {
        type: String,
        default: null
    },

    processingTime: {
        type: Number,
        default: 0
    },

    errorMessage: {
        type: String,
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Prediction",
    predictionSchema
);