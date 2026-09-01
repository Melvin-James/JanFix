import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";

import type { UploadFolder } from "../../../domain/enums/UploadFolder.js";

export interface IUploadFileUseCase {

    execute(file: Express.Multer.File, folder: UploadFolder): Promise<UploadedFile>;

}