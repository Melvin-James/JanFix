import express from "express";
import authRoutes from "./presentation/routes/authRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);

export default app;