import { useState } from "react";

import type { UploadedFile } from "../types/uploadedFile";

import { uploadFile } from "../services/uploadService";

interface CommunityPhotosFieldProps{
    
    value?: UploadedFile[];

    onChange: (files:UploadedFile[]) => void;

}

function CommunityPhotosField({
    value = [],
    onChange,
}: CommunityPhotosFieldProps) {
    const [loading, setLoading] = useState(false);

    const [error, setError] = 
        useState<string | null>(null);

    const handleFileChange = async(
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFiles = 
            Array.from(event.target.files ?? []);

            if(!selectedFiles.length){
                return;
            }

            const remainingSlots = 
                5 - value.length;

            if(selectedFiles.length > remainingSlots) {
                setError(
                    `You can upload a maximum of 5 photos. You can add ${remainingSlots} more`
                );

                event.target.value = "";

                return;
            }

            try{
                setLoading(true);

                setError(null);

                const uploadedFiles: UploadedFile[] = [];

                for(const file of selectedFiles){
                    const uploadedFile = 
                        await uploadFile(
                            file,
                            "provider/community-photos"
                        );
                    
                    uploadedFiles.push(
                        uploadedFile
                    );
                }

                onChange([
                    ...value,
                    ...uploadedFiles,
                ]);

            } catch (error){

                console.error(error);

                setError(
                    "Failed to upload one or more photos."
                );
            } finally {

                setLoading(false);

                event.target.value = "";

            }
    };

    const removePhoto = (
        index: number
    ) => {

        onChange(
            value.filter(
                (_, i) => i !== index
            )
        );
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
                Previous Community Photos
            </label>

            <p className="text-sm text-slate-500">
                Upload up to 5 photos showing your previous community work.
            </p>

            {value.length < 5 && (
                <input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handleFileChange}
                    disabled={loading}
                    className="block w-full text-sm text-slate-600"
                />
            )} 

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

            {value.length > 0 && (
                <div className="space-y-2">
                    {value.map((file,index) => (
                        <div key={file.key} className="flex items-center justify-between rounded-md border px-3 py-2">
                            <span className="text-sm text-green-600">
                                ✓ {file.originalName}
                            </span>

                            <button type="button" onClick={() => removePhoto(index)}>Remove</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CommunityPhotosField;