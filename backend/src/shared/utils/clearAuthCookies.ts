import type { Response } from "express";

import { AuthCookie, AuthCookieClearOptions } from "../constants/auth.constants.ts";

export const clearAuthCookies = (res: Response): void => {
    
    res.clearCookie(
        AuthCookie.ACCESS_TOKEN,
        AuthCookieClearOptions
    );

    res.clearCookie(
        AuthCookie.REFRESH_TOKEN,
        AuthCookieClearOptions
    );
};