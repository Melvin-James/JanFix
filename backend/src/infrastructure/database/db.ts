import mongoose from "mongoose";
import { env } from "../config/env.js"
const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI as string);

        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);

        process.exit(1);
    }
};

export default connectDB;