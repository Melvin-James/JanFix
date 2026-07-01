import type { Request, Response } from "express";

import type { IUploadFileUseCase } from "../../../application/use-cases/usecase interfaces/IUploadFileUseCase.js";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

export class UploadController {

    constructor(private uploadFileUseCase: IUploadFileUseCase) { }

    upload = asyncHandler(async (req: Request, res: Response) => {

        const file = req.file!;

        const folder = req.body.folder;

        const uploadedFile = await this.uploadFileUseCase.execute(file, folder);

        res.status(HttpStatusCode.OK).json({ success: true, file: uploadedFile });

    });

}