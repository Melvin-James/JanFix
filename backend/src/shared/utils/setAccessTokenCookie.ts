import type { Response } from "express";

import { AuthCookie, AuthCookieOptions } from "../constants/auth.constants.js";


export const setAccessTokenCookie = (
    res: Response,
    accessToken: string,
): void => {
    res.cookie(
        AuthCookie.ACCESS_TOKEN,
        accessToken,
        AuthCookieOptions.accessToken
    )
}