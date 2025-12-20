import { NextFunction, Request, Response } from "express";
import Review from "../models/Review";
import logger from "../config/logger";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../utils/AppError";
import { reviewsCreatedTotal } from "../config/metrics";
import { getPagination, formatPaginatedResponse } from "../utils/pagination";

export const getAllReviewsByMovie = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { movieId } = req.params;
    const { limit, offset, currentPage } = getPagination(
      req.query.page,
      req.query.size
    );

    const { count, rows } = await Review.findAndCountAll({
      where: {
        movieId,
      },
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    res
      .status(200)
      .json(formatPaginatedResponse(count, limit, currentPage, rows));
  } catch (error) {
    logger.error({ error }, "Error retrieving reviews");
    next(error);
  }
};

export const getAllReviewsByUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(401, "Unauthorized");

    const { limit, offset, currentPage } = getPagination(
      req.query.page,
      req.query.size
    );

    const { count, rows } = await Review.findAndCountAll({
      where: {
        userId,
      },
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    res
      .status(200)
      .json(formatPaginatedResponse(count, limit, currentPage, rows));
  } catch (error) {
    logger.error({ error }, "Error retrieving reviews");
    next(error);
  }
};

export const getAllReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== "admin") {
      throw new AppError(403, "Forbidden: Only admins can view all reviews");
    }

    const { limit, offset, currentPage } = getPagination(
      req.query.page,
      req.query.size
    );

    const { count, rows } = await Review.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    res
      .status(200)
      .json(formatPaginatedResponse(count, limit, currentPage, rows));
  } catch (error) {
    logger.error({ error }, "Error retrieving reviews");
    next(error);
  }
};

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.create(req.body);
    reviewsCreatedTotal.inc();
    res.status(201).json(review);
  } catch (error: any) {
    logger.error({ error }, "Error creating review");
    if (error.name === "SequelizeValidationError") {
      return next(
        new AppError(400, error.errors.map((e: any) => e.message).join(", "))
      );
    }
    next(error);
  }
};

export const updateReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const review = await Review.findByPk(id);
    if (!review) throw new AppError(404, "Review not found");
    if (review.userId !== userId && userRole !== "admin") {
      throw new AppError(403, "You are not authorized to update this review");
    }

    await review.update(req.body);
    res.status(200).json(review);
  } catch (error: any) {
    logger.error({ error }, `Error updating review with id ${req.params.id}`);
    if (error.name === "SequelizeValidationError") {
      return next(
        new AppError(400, error.errors.map((e: any) => e.message).join(", "))
      );
    }
    next(error);
  }
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const review = await Review.findByPk(id);
    if (!review) throw new AppError(404, "Review not found");

    if (review.userId !== userId && userRole !== "admin") {
      throw new AppError(403, "You are not authorized to delete this review");
    }

    await review.destroy();
    res.status(204).send();
  } catch (error) {
    logger.error({ error }, `Error deleting review with id ${req.params.id}`);
    next(error);
  }
};
