import "dotenv/config";

export const env = {
    PORT: process.env.PORT!,
    MONGO_URI: process.env.MONGO_URI!,
    REDIS_URL: process.env.REDIS_URL!,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    EMAIL_USER: process.env.EMAIL_USER!,
    EMAIL_PASS: process.env.EMAIL_PASS!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
};