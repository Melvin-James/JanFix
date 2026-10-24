import {PutObjectCommand, GetObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3";

import { v4 as uuid } from "uuid";

import { s3Client } from "../config/s3.js";
import { env } from "../config/env.js";

import type { IStorageService } from "../../application/services/IStorageService.js";

import type { UploadedFile } from "../../domain/entities/UploadedFile.js";

import type { UploadFolder } from "../../domain/enums/UploadFolder.js";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const PRESIGNED_URL_EXPIRY_SECONDS = 900;

export class S3StorageService implements IStorageService {

    async upload(file: Express.Multer.File, folder: UploadFolder): Promise<UploadedFile> {

        const bucket = env.AWS_BUCKET_NAME || process.env.AWS_BUCKET_NAME;

        if(!bucket) throw new Error("AWS_BUCKET_NAME not configured");

        const key = `${folder}/${uuid()}-${file.originalname}`;

        await s3Client.send(

            new PutObjectCommand({

                Bucket: bucket,

                Key: key,

                Body: file.buffer,

                ContentType: file.mimetype,
            })
        );

        const url = await this.getPresignedUrl(key);

        return {

            key,

            url,

            originalName: file.originalname,

            mimeType: file.mimetype,

            size: file.size,
        };
    }

    async getPresignedUrl(key: string): Promise<string> {
        
        const bucket = env.AWS_BUCKET_NAME || process.env.AWS_BUCKET_NAME;

        if(!bucket) {
            throw new Error("AWS_BUCKET_NAME is not configured");
        }

        const command = new GetObjectCommand({

            Bucket: bucket,

            Key: key,
        });

        return getSignedUrl(s3Client, command, {

            expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
        });
    }

    async delete(key: string): Promise<void> {

        const bucket = env.AWS_BUCKET_NAME || process.env.AWS_BUCKET_NAME;

        await s3Client.send(

            new DeleteObjectCommand({

                Bucket: bucket,

                Key: key,
            })
        );
    }
}