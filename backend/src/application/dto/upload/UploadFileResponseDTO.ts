import type { UploadedFile } from "../../../domain/entities/UploadedFile.ts";

export interface UploadFileResponseDTO {
    file: UploadedFile;
}