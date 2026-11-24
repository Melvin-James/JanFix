import type { Request, Response } from "express";

import type { IUploadFileUseCase } from "../../../application/use-cases/usecase interfaces/provider/IUploadFileUseCase.ts";

import asyncHandler from "../../../shared/utils/asyncHandler.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import { UploadFolder } from "../../../domain/enums/UploadFolder.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import type { UploadFileResponseDTO } from "../../../application/dto/upload/UploadFileResponseDTO.ts";
import { sendSuccess } from "../../../shared/response/index.ts";

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

        sendSuccess(res, response, undefined, HttpStatusCode.OK);

    });

}