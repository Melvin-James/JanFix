import mongoose from "mongoose";
import { env } from "../config/env.js"
import logger from "../../shared/utils/logger.js";
const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI as string);

        logger.info("MongoDB Connected");
    } catch (error: unknown) {
        logger.error({err: error}, "MongoDB Connection failed");

        process.exit(1);
    }
};

export default connectDB;