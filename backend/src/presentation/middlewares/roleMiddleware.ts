import type { Response, NextFunction } from "express";

import ApiError from "../../shared/utils/apiError.js";

import type { AuthRequest } from "../../shared/types/AuthRequest.js";

export const authorizeRoles = (

    ...allowedRoles: string[]

) => {
    return (

        req: AuthRequest,

        _res: Response,

        next: NextFunction

    ): void => {
        if (!req.user){ 
            throw new ApiError(401, "Unauthorized"); 
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(403,"Forbidden");
        }
        next();
    };
};