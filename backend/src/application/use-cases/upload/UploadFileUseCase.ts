import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";

import type { IStorageService } from "../../services/IStorageService.js";

import type { IUploadFileUseCase } from "../usecase interfaces/IUploadFileUseCase.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

export class UploadFileUseCase implements IUploadFileUseCase {

    constructor(

        private storageService: IStorageService

    ) {}

    async execute(

        file: Express.Multer.File,

        folder: string

    ): Promise<UploadedFile> {

        if (!file) {

            throw new ApiError(

                HttpStatusCode.BAD_REQUEST,

                "No file uploaded"

            );
        }

        return await this.storageService.upload(file, folder);

    }

}