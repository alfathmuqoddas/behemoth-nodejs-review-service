import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import logger from "../config/logger";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err);

  if (err instanceof AppError || err.isAppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // 3. Handle Sequelize Errors
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid data provided",
        details: err.errors?.map((e: any) => ({
          field: e.path,
          message: e.message,
        })),
      },
    });
  }

  if (err.name === "SequelizeConnectionError") {
    return res.status(503).json({
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Database connection failed",
      },
    });
  }

  const isDev = process.env.NODE_ENV === "development";
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isDev ? err.message : "Something went wrong",
      stack: isDev ? err.stack : undefined,
    },
  });
};
