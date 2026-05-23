const swaggerJsDoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Dataset Service API",
            version: "1.0.0",
            description: "API documentation for Dataset Service",
        },

        servers: [
            {
                url: "http://localhost:3002",
                description: "Local server",
            },
        ],
    },

    apis: [
        "./src/docs/*.swagger.js",
    ],
};

const specs = swaggerJsDoc(options);

module.exports = specs;