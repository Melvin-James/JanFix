export const AuthCookie = {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
} as const;

export const AuthCookieOptions = {
    accessToken: {
        httpOnly: true,
        secure: false,
        sameSite: "strict" as const,
        maxAge: 15 * 60 * 1000,
    },

    refreshToken: {
        httpOnly: true,
        secure: false,
        sameSite: "strict" as const,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
} as const;

export const AuthCookieClearOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "strict" as const
}