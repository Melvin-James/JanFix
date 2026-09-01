import { Router } from "express";

import { upload } from "../middlewares/uploadMiddleware.js";

import { UploadController } from "../controllers/upload/UploadController.js";

import { UploadFileUseCase } from "../../application/use-cases/upload/UploadFileUseCase.js";

import { S3StorageService } from "../../infrastructure/storage/S3StorageService.js";

import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

const storageService = new S3StorageService();

const uploadUseCase = new UploadFileUseCase(storageService);

const controller = new UploadController(uploadUseCase);

router.post("/", authenticate, upload.single("file"), controller.upload);

export default router;