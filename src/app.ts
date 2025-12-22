import express, { Application, Request, Response } from "express";
import pinoHttp from "pino-http";
import reviewRoutes from "./routes/reviewRoutes";
import healthRoutes from "./routes/healthRoutes";
import logger from "./config/logger";
import { register } from "./config/metrics";
import { metricsMiddleware } from "./middleware/metricsMiddleware";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

app.use(pinoHttp({ logger }));
app.use(metricsMiddleware);

app.use(express.json());

app.get("/metrics", async (req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/", reviewRoutes);
app.use("/health", healthRoutes);

app.use(errorHandler);

export default app;
