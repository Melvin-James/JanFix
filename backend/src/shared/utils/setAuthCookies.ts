import type { Response } from "express";

export const setAuthCookies = (res: Response, refreshToken: string): void => {

    res.cookie(

        "refreshToken",

        refreshToken,

        {

            httpOnly: true,

            secure: false,

            sameSite: "strict",

            maxAge:
                7 * 24 * 60 * 60 * 1000,
        }
    );
};