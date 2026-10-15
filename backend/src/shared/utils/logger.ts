import pino from "pino";

import { env } from "../../infrastructure/config/env.js";

const isProduction = env.NODE_ENV === "production"

const logger = pino({

    level: env.LOG_LEVEL ?? "info",

    ...(!isProduction && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
            },
        },
    }),
});

export default logger;