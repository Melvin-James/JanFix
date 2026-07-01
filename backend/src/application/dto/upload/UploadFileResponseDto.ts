import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";

export interface UploadFileResponseDto {
    file: UploadedFile;
}