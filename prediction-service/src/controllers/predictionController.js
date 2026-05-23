const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const Prediction = require("../models/Prediction");
const logActivity = require("../utils/logActivity");

// RUN PREDICTION
exports.runPrediction = async (req, res) => {

    const startTime = Date.now();

    try {

        const { datasetId } = req.body;

        /*
            VALIDATE DATASET ID
        */

        if (!datasetId) {

            await logActivity(
                "RUN_PREDICTION_FAILED",
                "Prediction failed: Dataset ID is required",
                req.user
            );

            return res.status(400).json({
                message: "Dataset ID is required"
            });
        }

        /*
            STEP 1
            GET DATASET INFORMATION
        */

        let datasetResponse;

        try {

            datasetResponse = await axios.get(
                `${process.env.DATASET_SERVICE_URL}/api/datasets/${datasetId}`,
                {
                    headers: {
                        Authorization: req.headers.authorization
                    }
                }
            );

        } catch (error) {

            await logActivity(
                "RUN_PREDICTION_FAILED",
                `Prediction failed: Dataset ${datasetId} not found`,
                req.user
            );

            return res.status(404).json({
                message: "Dataset not found"
            });
        }

        const dataset = datasetResponse.data;

        /*
            STEP 2
            READ FILE FROM SHARED-UPLOADS
        */

        const filePath = path.join(
            "/app/shared-uploads",
            dataset.fileName
        );

        if (!fs.existsSync(filePath)) {

            await logActivity(
                "RUN_PREDICTION_FAILED",
                `Prediction failed: Dataset file not found (${dataset.originalName})`,
                req.user
            );

            return res.status(404).json({
                message: "Dataset file not found"
            });
        }

        /*
            STEP 3
            SEND FILE TO FLASK
        */

        const formData = new FormData();

        formData.append(
            "file",
            fs.createReadStream(filePath)
        );

        let flaskResponse;

        try {

            flaskResponse = await axios.post(
                `${process.env.FLASK_SERVICE_URL}/predict`,
                formData,
                {
                    headers: formData.getHeaders(),
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity
                }
            );

        } catch (error) {

            await logActivity(
                "RUN_PREDICTION_FAILED",
                `Prediction failed: Flask prediction service error for ${dataset.originalName}`,
                req.user
            );

            return res.status(500).json({
                message: "Prediction service unavailable"
            });
        }

        const flaskData = flaskResponse.data;

        const overallResult =
            flaskData.overall || [];

        const overallPlot =
            flaskData.overall_plot_path || null;

        const perBatch =
            flaskData.per_batch || {};

        const perSample =
            flaskData.per_sample || {};

        const batchPlots =
            flaskData.batch_plot_paths || {};

        const predictionFolder =
            flaskData.timestamp || null;

        /*
            STEP 7
            CALCULATE PROCESSING TIME
        */

        const processingTime =
            (Date.now() - startTime) / 1000;

        /*
            STEP 8
            SAVE PREDICTION
        */

        const prediction = await Prediction.create({

            datasetId: dataset._id,

            datasetName: dataset.originalName,

            generatedBy: req.user.id,

            generatedByName: req.user.username,

            status: "Completed",

            overallPlot,

            overallResult,

            batchPlots,

            perBatch,

            perSample,

            predictionFolder,

            processingTime
        });

        /*
            STEP 9
            LOG ACTIVITY
        */

        await logActivity(
            "RUN_PREDICTION",
            `Prediction generated for ${dataset.originalName}`,
            req.user
        );

        /*
            STEP 10
            RETURN RESPONSE
        */

        res.status(200).json({
            message: "Prediction completed successfully",
            prediction
        });

    } catch (error) {

        await logActivity(
            "RUN_PREDICTION_FAILED",
            `Prediction failed: ${error.message}`,
            req.user
        );

        console.log(error);

        res.status(500).json({
            message: "Prediction failed",
            error: error.message
        });
    }
};


// GET ALL PREDICTIONS
exports.getPredictions = async (req, res) => {

    try {

        const predictions = await Prediction.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: predictions.length,
            predictions
        });

    } catch (error) {

        await logActivity(
            "GET_PREDICTIONS_FAILED",
            `Failed to get predictions: ${error.message}`,
            req.user
        );

        res.status(500).json({
            message: "Error getting predictions",
            error: error.message
        });
    }
};


// GET PREDICTION BY ID
exports.getPredictionById = async (req, res) => {

    try {

        const prediction =
            await Prediction.findById(req.params.id);

        if (!prediction) {

            await logActivity(
                "GET_PREDICTION_BY_ID_FAILED",
                `Prediction not found with id ${req.params.id}`,
                req.user
            );

            return res.status(404).json({
                message: "Prediction not found"
            });
        }

        res.status(200).json(prediction);

    } catch (error) {

        await logActivity(
            "GET_PREDICTION_BY_ID_FAILED",
            `Failed to get prediction: ${error.message}`,
            req.user
        );

        res.status(500).json({
            message: "Error getting prediction",
            error: error.message
        });
    }
};