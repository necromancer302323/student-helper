
import type {
  Request,
  Response,
  NextFunction
} from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    success: false,
    error: "An unexpected server error occurred."
  });
}
