import { env } from "./infrastructure/config/env.js";
import redisClient from "./infrastructure/config/redis.js";

import app from "./app.js";
import connectDB from "./infrastructure/database/db.js";

const PORT = env.PORT || 5000;

connectDB();

redisClient.connect()
  .then(() => {
    console.log("Redis Connected");
  })
  .catch((error) => {
    console.error(error);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});