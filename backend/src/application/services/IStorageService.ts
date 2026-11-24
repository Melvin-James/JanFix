import type { UploadedFile } from "../../domain/entities/UploadedFile.ts";

import type { UploadFolder } from "../../domain/enums/UploadFolder.ts";

export interface IStorageService {
  upload(
    file: Express.Multer.File,
    folder: UploadFolder,
  ): Promise<UploadedFile>;
  getPresignedUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}
