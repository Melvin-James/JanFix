import { env } from "./infrastructure/config/env.js";

import redisClient from "./infrastructure/config/redis.js";

import app from "./app.js";

import connectDB from "./infrastructure/database/db.js";

import logger from "./shared/utils/logger.js";

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