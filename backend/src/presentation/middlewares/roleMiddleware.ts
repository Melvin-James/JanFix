import type { Response, NextFunction } from "express";

import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../shared/constants/messages.js";

import ApiError from "../../shared/utils/apiError.js";

import type { AuthRequest } from "../../shared/types/AuthRequest.js";

import type { Role } from "../../domain/enums/Role.js";

export const authorizeRoles = (

    ...allowedRoles: Role[]

) => {
    return (

        req: AuthRequest,

        _res: Response,

        next: NextFunction

    ): void => {
        if (!req.user) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
        }

        const hasRequiredRole = req.user.roles.some(role => allowedRoles.includes(role));

        if (!hasRequiredRole) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, AppMessages.ERROR.FORBIDDEN);
        }

        next();
    };
};