import type { Response } from "express";

import { AuthCookie, AuthCookieOptions } from "../constants/auth.constants.ts";

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {

    res.cookie(
        AuthCookie.ACCESS_TOKEN,
        accessToken,
        AuthCookieOptions.accessToken
    );

    res.cookie(
        AuthCookie.REFRESH_TOKEN,
        refreshToken,
        AuthCookieOptions.refreshToken,
    );
};