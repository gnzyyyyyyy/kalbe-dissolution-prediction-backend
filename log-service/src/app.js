const express = require("express");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const logRoutes = require("./routes/logRoutes");

const app = express();

app.use(cors());
app.use(express.json());

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
app.use("/api/logs", logRoutes);

module.exports = app;