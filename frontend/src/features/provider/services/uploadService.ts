import axiosInstance from "../../../api/axios";

import type { UploadedFile } from "../types/uploadedFile";

export const uploadFile = async (
    file: File,
    folder: string
): Promise<UploadedFile> => {

    const formData = new FormData();

    formData.append("file", file);
    formData.append("folder", folder);

    const response = await axiosInstance.post(
        "/upload",
        formData
    );

    return response.data.data.file;
};