import type { RequestHandler } from "express";

import ApiError from "../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";

import type { ApplicationMode } from "../../shared/types/AccessTokenPayload.js";
import { AppMessages } from "../../shared/constants/messages.js";

export const requireActiveMode = (
    requiredMode: ApplicationMode
): RequestHandler => {
    return (req, _res, next) => {
        if(!req.user) {
            return next(
                new ApiError(
                    HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED
                )
            );
        }

        if(req.user.activeMode !== requiredMode) {
            return next(
                new ApiError(
                    HttpStatusCode.FORBIDDEN, AppMessages.ERROR.FORBIDDEN
                )
            );
        }

        next();
    };
};