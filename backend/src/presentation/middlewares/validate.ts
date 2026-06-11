import type { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";
import type { ZodSchema } from "zod";
import ApiError from "../../shared/utils/apiError.js";

const validate =
    (schema: ZodSchema) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.body);

                next();
            } catch (error: any) {
                const message =
                    error.issues?.[0]?.message || "Validation Error";

                next(new ApiError(HttpStatusCode.BAD_REQUEST, message));
            }
        };

export default validate;