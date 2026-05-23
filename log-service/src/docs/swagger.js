const swaggerJsDoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Log Service API",
            version: "1.0.0",
            description: "API documentation for Log Service",
        },

        servers: [
            {
                url: "http://localhost:3004",
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