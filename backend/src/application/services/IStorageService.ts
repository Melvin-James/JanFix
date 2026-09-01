import type { UploadedFile } from "../../domain/entities/UploadedFile.js";

import type { UploadFolder } from "../../domain/enums/UploadFolder.js";

export interface IStorageService {

    upload(file: Express.Multer.File, folder: UploadFolder): Promise<UploadedFile>;

    delete(key: string): Promise<void>;
}