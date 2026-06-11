import type { Response, NextFunction } from "express";
import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../shared/constants/messages.js";

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
        if (!req.user) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, AppMessages.ERROR.FORBIDDEN);
        }
        next();
    };
};