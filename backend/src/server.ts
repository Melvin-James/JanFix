import { env } from "./infrastructure/config/env.ts";

import redisClient from "./infrastructure/config/redis.ts";

import app from "./app.ts";

import connectDB from "./infrastructure/database/db.ts";

import logger from "./shared/utils/logger.ts";

const PORT = env.PORT || 5000;

connectDB();

redisClient.connect()
  .then(() => {
    logger.info("Redis Connected");
  })
  .catch((error) => {
    logger.error({err: error}, "Redis connection failed");
  });

app.listen(PORT, () => {
  logger.info({port: PORT}, `Server running on port ${PORT}`);
});