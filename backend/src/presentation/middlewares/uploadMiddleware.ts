import multer from "multer";
import { AppMessages } from "../../shared/constants/messages.js";

export const upload = multer({

    storage: multer.memoryStorage(),

    limits: {

        fileSize: 10 * 1024 * 1024,
    },

    fileFilter(req, file, cb) {

        const allowed = [

            "image/jpeg",

            "image/png",

            "application/pdf",
        ];

        if (!allowed.includes(file.mimetype)) {

            return cb(

                new Error(AppMessages.ERROR.UNSUPPORTED_FILE_TYPE)
            );
        }

        cb(null, true);
    },
});