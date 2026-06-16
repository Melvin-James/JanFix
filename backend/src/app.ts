import express from "express";
import authRoutes from "./presentation/routes/authRoutes.js";
import providerRoutes from "./presentation/routes/providerRoutes.js";
import errorMiddleware from "./presentation/middlewares/errorMiddleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/provider",providerRoutes)

app.use(errorMiddleware);

export default app;