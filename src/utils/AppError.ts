export class AppError extends Error {
  public readonly isAppError = true;
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    options?: {
      code?: string;
      isOperational?: boolean;
      details?: unknown;
    }
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = options?.code ?? "INTERNAL_ERROR";
    this.isOperational = options?.isOperational ?? true;
    this.details = options?.details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
