const express = require('express');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const specs = require('./docs/swagger');

const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Swagger API Documentation
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * Routes
 */
app.use("/api/users", userRoutes);

module.exports = app;