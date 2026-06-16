import type{
  NextFunction,
  Request,
  Response,
} from "express";

import ApiError from "../../shared/utils/apiError.js";
import { AppMessages } from "../../shared/constants/messages.js";
import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
   if (res.headersSent) {

    return next(err);
  }

  console.error(err);

  let statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
  let message = AppMessages.ERROR.INTERNAL_SERVER_ERROR;

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