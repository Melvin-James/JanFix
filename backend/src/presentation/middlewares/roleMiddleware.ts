import type { Response, NextFunction } from "express";

import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../shared/constants/messages.ts";

import ApiError from "../../shared/utils/apiError.ts";

import type { AuthRequest } from "../../shared/types/AuthRequest.ts";

import type { Role } from "../../domain/enums/Role.ts";

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