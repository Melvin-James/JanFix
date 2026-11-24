import { Router } from "express";

import { upload } from "../middlewares/uploadMiddleware.ts";

import { UploadController } from "../controllers/upload/UploadController.ts";

import { UploadFileUseCase } from "../../application/use-cases/upload/UploadFileUseCase.ts";

import { S3StorageService } from "../../infrastructure/storage/S3StorageService.ts";

import { authenticate } from "../middlewares/authMiddleware.ts";

import { ApiEndpoints } from "../../shared/constants/apiEndpoints.ts";

const router = Router();

const storageService = new S3StorageService();

const uploadUseCase = new UploadFileUseCase(storageService);

const controller = new UploadController(uploadUseCase);

router.post(ApiEndpoints.UPLOAD.ROOT, authenticate, upload.single("file"), controller.upload);

export default router;