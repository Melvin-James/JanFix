import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";

export interface UploadFileResponseDTO {
    file: UploadedFile;
}