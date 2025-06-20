module.exports = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Simple backend",
      version: "1.0.0",
      description: "API documentation for my express app",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./auth/*.js", "./users/*.js", "./posts/*.js", "./main.js"],
};
