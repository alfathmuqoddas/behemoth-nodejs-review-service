import { Request, Response } from "express";
import Review from "../models/Review";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import { reviewsCreatedTotal } from "../config/metrics";
import { getPagination, formatPaginatedResponse } from "../utils/pagination";

export const getAllReviewsByMovie = catchAsync(
  async (req: Request, res: Response) => {
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
  }
);

export const getAllReviewsByUser = catchAsync(
  async (req: AuthRequest, res: Response) => {
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
  }
);

export const getAllReviews = catchAsync(
  async (req: AuthRequest, res: Response) => {
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
  }
);

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const review = await Review.create(req.body);
  reviewsCreatedTotal.inc();
  res.status(201).json(review);
});

export const updateReview = catchAsync(
  async (req: AuthRequest, res: Response) => {
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
  }
);

export const deleteReview = catchAsync(
  async (req: AuthRequest, res: Response) => {
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
  }
);
