import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { RegisterRoutes } from "./generated/routes.js";
import * as middlewares from "./middlewares.js";
import { httpLogger } from "./logger.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(express.static("public"));

app.use(httpLogger);

RegisterRoutes(app);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/api/fetcher/swagger.json",
    },
  }),
);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
