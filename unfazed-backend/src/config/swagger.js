const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Unfazed API",
      version: "1.0.0",
      description: "Unfazed Therapist Booking Platform API",
    },

    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },

  apis: ["./src/modules/**/routes/*.js"],
});

module.exports = swaggerSpec;
