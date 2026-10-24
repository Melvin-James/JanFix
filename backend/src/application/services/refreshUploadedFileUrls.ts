import type { UploadedFile } from "../../domain/entities/UploadedFile.js";
import type { ProviderDocuments } from "../../domain/entities/ProviderProfile.js";
import type { IStorageService } from "./IStorageService.js";

/**
 * Extracts pure S3 object key even if an existing database record
 * stored a full legacy S3 URL.
 */
export function extractS3Key(key: string): string {
    if (!key) return "";
    if (key.startsWith("http://") || key.startsWith("https://")) {
        try {
            const urlObj = new URL(key);
            return decodeURIComponent(urlObj.pathname.replace(/^\/+/, ""));
        } catch {
            return key;
        }
    }
    return key;
}

export async function refreshUploadedFileUrl(
    file: UploadedFile | undefined | null,
    storageService: IStorageService,
    urlCache?: Map<string, string>
): Promise<UploadedFile | undefined> {
    if (!file || !file.key) return undefined;
    const cleanKey = extractS3Key(file.key);
    if (!cleanKey) return undefined;

    let url = urlCache?.get(cleanKey);
    if (!url) {
        url = await storageService.getPresignedUrl(cleanKey);
        urlCache?.set(cleanKey, url);
    }

    return {
        ...file,
        key: cleanKey,
        url,
    };
}

export async function refreshUploadedFileUrls(
    files: UploadedFile[] | undefined | null,
    storageService: IStorageService,
    urlCache?: Map<string, string>
): Promise<UploadedFile[]> {
    if (!files || !Array.isArray(files) || files.length === 0) {
        return [];
    }

    return Promise.all(
        files.map(async (file) => {
            const refreshed = await refreshUploadedFileUrl(file, storageService, urlCache);
            return refreshed ?? file;
        })
    );
}

export async function refreshProviderDocuments(
    documents: ProviderDocuments | undefined | null,
    storageService: IStorageService,
    urlCache?: Map<string, string>,
    options: { includeSensitive?: boolean } = { includeSensitive: true }
): Promise<ProviderDocuments> {
    if (!documents) {
        return {};
    }

    const includeSensitive = options.includeSensitive ?? true;

    const [
        identityProof,
        profileImage,
        previousCommunityPhotos,
        ngoRegistrationDocument,
        logo,
    ] = await Promise.all([
        includeSensitive && documents.identityProof
            ? refreshUploadedFileUrl(documents.identityProof, storageService, urlCache)
            : undefined,
        documents.profileImage
            ? refreshUploadedFileUrl(documents.profileImage, storageService, urlCache)
            : undefined,
        documents.previousCommunityPhotos
            ? refreshUploadedFileUrls(documents.previousCommunityPhotos, storageService, urlCache)
            : undefined,
        includeSensitive && documents.ngoRegistrationDocument
            ? refreshUploadedFileUrl(documents.ngoRegistrationDocument, storageService, urlCache)
            : undefined,
        documents.logo
            ? refreshUploadedFileUrl(documents.logo, storageService, urlCache)
            : undefined,
    ]);

    const result: ProviderDocuments = {};

    if (identityProof) result.identityProof = identityProof;
    if (profileImage) result.profileImage = profileImage;
    if (previousCommunityPhotos && previousCommunityPhotos.length > 0) {
        result.previousCommunityPhotos = previousCommunityPhotos;
    }
    if (ngoRegistrationDocument) result.ngoRegistrationDocument = ngoRegistrationDocument;
    if (logo) result.logo = logo;

    return result;
}

