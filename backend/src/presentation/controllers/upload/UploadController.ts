import type { Request, Response } from "express";

import type { IUploadFileUseCase } from "../../../application/use-cases/usecase interfaces/IUploadFileUseCase.js";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import ApiError from "../../../shared/utils/apiError.js";

import { UploadFolder } from "../../../domain/enums/UploadFolder.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import type { UploadFileResponseDTO } from "../../../application/dto/upload/UploadFileResponseDTO.js";

export class UploadController {

    constructor(private _uploadFileUseCase: IUploadFileUseCase) { }

    upload = asyncHandler(async (req: Request, res: Response) => {

        const file = req.file!;

        const folder = req.body.folder as UploadFolder;

        if (!Object.values(UploadFolder).includes(folder)) {

            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.INVALID_UPLOAD_FOLDER);
        }

        const uploadedFile = await this._uploadFileUseCase.execute(file, folder);

        const response: UploadFileResponseDTO = {
            file: uploadedFile,
        };

        res.status(HttpStatusCode.OK).json({ success: true, data: response });

    });

}