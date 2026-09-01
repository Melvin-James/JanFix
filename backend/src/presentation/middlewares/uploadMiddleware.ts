import multer from "multer";

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

                new Error("Unsupported file type")
            );
        }

        cb(null, true);
    },
});