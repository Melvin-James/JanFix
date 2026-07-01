import {PutObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3";

import { v4 as uuid } from "uuid";

import { s3Client } from "../config/s3.js";

import type { IStorageService } from "../../application/services/IStorageService.js";

import type { UploadedFile } from "../../domain/entities/UploadedFile.js";

export class S3StorageService implements IStorageService {

    async upload(file: Express.Multer.File, folder: string): Promise<UploadedFile> {

        const key = `${folder}/${uuid()}-${file.originalname}`;

        await s3Client.send(

            new PutObjectCommand({

                Bucket: process.env.AWS_BUCKET_NAME,

                Key: key,

                Body: file.buffer,

                ContentType: file.mimetype,
            })
        );

        return {

            key,

            url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,

            originalName: file.originalname,

            mimeType: file.mimetype,

            size: file.size,
        };
    }

    async delete(key: string): Promise<void> {

        await s3Client.send(

            new DeleteObjectCommand({

                Bucket: process.env.AWS_BUCKET_NAME,

                Key: key,
            })
        );
    }
}