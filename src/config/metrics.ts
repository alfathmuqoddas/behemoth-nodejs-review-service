import {
  Counter,
  Histogram,
  register,
  collectDefaultMetrics,
} from "prom-client";

collectDefaultMetrics({ register, prefix: "review_service_" });

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

export const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10],
});

export const reviewsCreatedTotal = new Counter({
  name: "reviews_created_total",
  help: "Total number of movies successfully added to the database",
});

export { register };
