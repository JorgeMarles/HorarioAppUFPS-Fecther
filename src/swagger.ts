const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Horario App UFPS API",
      version: "1.0.0",
      description: "API para el scrapper de horarios",
    },
    servers: [{ url: "/api/v1" }],
  },
  // ajusta las rutas donde pones comentarios JSDoc para endpoints
  apis: ["./src/api/**/*.ts", "./src/**/*.ts"],
};

export default options;
