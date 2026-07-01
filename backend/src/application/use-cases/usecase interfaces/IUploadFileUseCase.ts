import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";

export interface IUploadFileUseCase {

    execute(file: Express.Multer.File, folder: string): Promise<UploadedFile>;

}