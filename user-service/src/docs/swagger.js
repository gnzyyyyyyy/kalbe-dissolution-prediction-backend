const swaggerJsDoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "User Service API",
            version: "1.0.0",
            description: "API documentation for User Service",
        },
        servers: [
            {
                url: "http://localhost:3001",
                description: "Local server",
            },
        ]
    },

    apis: [
        "./src/docs/*.swagger.js",
        "./src/routes/*.js"
    ]
};

const specs = swaggerJsDoc(options);

module.exports = specs;