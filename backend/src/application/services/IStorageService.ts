import type { UploadedFile } from "../../domain/entities/UploadedFile.js";

export interface IStorageService {

    upload(file: Express.Multer.File, folder: string): Promise<UploadedFile>;

    delete(key: string): Promise<void>;
}