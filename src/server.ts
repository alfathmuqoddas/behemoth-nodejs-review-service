import app from "./app";
import sequelize from "./config/database";
import dotenv from "dotenv";
import logger from "./config/logger";
import { healthState } from "./utils/healthState";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection has been established successfully.");

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    healthState.markStarted();

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: starting graceful shutdown`);

      healthState.markShuttingDown();

      server.close(async () => {
        logger.info("HTTP server closed.");

        try {
          await sequelize.close();
          logger.info("Database connection closed.");

          process.exit(0);
        } catch (error) {
          logger.error({ error }, "Error during database disconnection:");
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error(
          "Could not close connections in time, forcefully shutting down"
        );
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error({ error }, "Unable to start the server:");
    process.exit(1);
  }
};

startServer();
