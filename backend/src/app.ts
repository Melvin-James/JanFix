import express from "express";
import authRoutes from "./presentation/routes/authRoutes.js";
import errorMiddleware from "./presentation/middlewares/errorMiddleware.js";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.use(errorMiddleware);

export default app;