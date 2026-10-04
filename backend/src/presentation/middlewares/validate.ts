import type { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";
import { ZodError, type ZodSchema } from "zod";
import ApiError from "../../shared/utils/apiError.js";

const validate =
    (schema: ZodSchema) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                req.body = schema.parse(req.body);

                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const message = error.issues?.[0]?.message || "Validation Error";
                    return next(new ApiError(HttpStatusCode.BAD_REQUEST, message));
                }

                next(error);
            }
        };

export default validate;