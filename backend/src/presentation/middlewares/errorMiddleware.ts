import type{
  NextFunction,
  Request,
  Response,
} from "express";

import ApiError from "../../shared/utils/apiError.js";

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;