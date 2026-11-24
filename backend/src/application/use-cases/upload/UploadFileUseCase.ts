import type { UploadedFile } from "../../../domain/entities/UploadedFile.ts";

import type { IStorageService } from "../../services/IStorageService.ts";

import type { IUploadFileUseCase } from "../usecase interfaces/provider/IUploadFileUseCase.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import type { UploadFolder } from "../../../domain/enums/UploadFolder.ts";

export class UploadFileUseCase implements IUploadFileUseCase {

    constructor(

        private _storageService: IStorageService

    ) {}

    async execute(

        file: Express.Multer.File,

        folder: UploadFolder

    ): Promise<UploadedFile> {

        if (!file) {

            throw new ApiError(

                HttpStatusCode.BAD_REQUEST,

                AppMessages.ERROR.NO_FILE_UPLOADED

            );
        }

        return await this._storageService.upload(file, folder);

    }

}