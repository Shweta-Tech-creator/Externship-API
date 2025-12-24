import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Externship API Documentation",
      version: "1.0.0",
      description: "API documentation for the externship project",
    },
  },
  apis: ["./src/routes/*.js"], // ← your route files
};

const swaggerSpec = swaggerJsdoc(options);

// Function that registers swagger
export function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  console.log("Swagger Docs available at: http://localhost:5000/api-docs");
}
