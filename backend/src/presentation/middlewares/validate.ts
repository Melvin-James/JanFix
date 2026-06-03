import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

const validate =
    (schema: ZodSchema) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.body);

                next();
            } catch (error: any) {
                return res.status(400).json({
                    success: false,
                    message: error.errors,
                });
            }
        };

export default validate;