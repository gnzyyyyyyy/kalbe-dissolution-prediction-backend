const express = require("express");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const datasetRoutes = require("./routes/datasetRoutes");
const datasetReportRoutes = require("./routes/datasetReportRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    "/reports",
    express.static("/app/shared-reports")
);

/**
 * Swagger Documentation
 */
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

/**
 * Routes
 */
app.use("/api/datasets", datasetRoutes);
app.use("/api/reports", datasetReportRoutes);

module.exports = app;