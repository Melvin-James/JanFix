import { useState } from "react";

import type { UploadedFile } from "../types/uploadedFile";

import { uploadFile } from "../services/uploadService";


interface FileUploadFieldProps {

    value?: UploadedFile;

    onChange: (file: UploadedFile | undefined) => void;

    folder: string;

    label: string;

}


function FileUploadField({

    value,

    onChange,

    folder,

    label,

}: FileUploadFieldProps) {


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState<string | null>(null);


    const handleFileChange =
        async (
            event: React.ChangeEvent<HTMLInputElement>
        ) => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            try {

                setLoading(true);

                setError(null);


                const uploadedFile =
                    await uploadFile(
                        file,
                        folder
                    );


                onChange(uploadedFile);


            } catch (error) {

                console.error(error);

                setError(
                    "Failed to upload file"
                );

            } finally {

                setLoading(false);

            }

        };


    return (

        <div className="space-y-2">

            <label className="block text-sm font-medium text-slate-700">

                {label}

            </label>


            <input

                type="file"

                onChange={handleFileChange}

                disabled={loading}

                className="block w-full text-sm text-slate-600"

            />


            {loading && (

                <p className="text-sm text-blue-600">

                    Uploading...

                </p>

            )}


            {error && (

                <p className="text-sm text-red-600">

                    {error}

                </p>

            )}


            {value && !loading && (

                <p className="text-sm text-green-600">

                    ✓ {value.originalName}

                </p>

            )}

        </div>

    );

}


export default FileUploadField;