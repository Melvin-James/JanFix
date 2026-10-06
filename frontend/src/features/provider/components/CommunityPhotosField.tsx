import {
  useId,
  useState,
  type ChangeEvent,
} from "react";

import {
  ImagePlus,
  LoaderCircle,
  Trash2,
} from "lucide-react";

import type { UploadedFile } from "../types/uploadedFile";
import { uploadFile } from "../services/uploadService";

interface CommunityPhotosFieldProps {
  value?: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}

function CommunityPhotosField({
  value = [],
  onChange,
}: CommunityPhotosFieldProps) {
  const inputId = useId();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(
      event.target.files ?? [],
    );

    if (!selectedFiles.length) {
      return;
    }

    const remainingSlots = 5 - value.length;

    if (selectedFiles.length > remainingSlots) {
      setError(
        `You can upload a maximum of 5 photos. You can add ${remainingSlots} more`,
      );

      event.target.value = "";
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const uploadedFiles: UploadedFile[] = [];

      for (const file of selectedFiles) {
        const uploadedFile = await uploadFile(
          file,
          "provider/community-photos",
        );

        uploadedFiles.push(uploadedFile);
      }

      onChange([...value, ...uploadedFiles]);
    } catch (error) {
      console.error(error);

      setError("Failed to upload one or more photos.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  const removePhoto = (index: number) => {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div>
      <div>
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-900"
        >
          Previous Community Work
        </label>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Upload up to 5 photos showing your previous community
          work.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {value.length < 5 && (
          <div>
            <input
              id={inputId}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFileChange}
              disabled={loading}
              className="sr-only"
            />

            <label
              htmlFor={inputId}
              className={`flex aspect-square min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-center transition-colors ${
                loading
                  ? "cursor-wait border-blue-300 bg-blue-50"
                  : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              {loading ? (
                <LoaderCircle
                  size={20}
                  className="animate-spin text-blue-600"
                  aria-hidden="true"
                />
              ) : (
                <ImagePlus
                  size={20}
                  className="text-blue-600"
                  aria-hidden="true"
                />
              )}

              <span className="mt-2 px-2 text-xs font-medium text-slate-600">
                {loading ? "Uploading..." : "Add photo"}
              </span>
            </label>
          </div>
        )}

        {value.map((file, index) => (
          <div
            key={file.key}
            className="group relative flex aspect-square min-h-28 min-w-0 flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 p-3 text-center"
          >
            <ImagePlus
              size={22}
              className="text-slate-400"
              aria-hidden="true"
            />

            <span className="mt-2 w-full truncate text-xs text-slate-600">
              {file.originalName}
            </span>

            <button
              type="button"
              onClick={() => removePhoto(index)}
              aria-label={`Remove ${file.originalName}`}
              title="Remove photo"
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-red-600 shadow-sm transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className="min-h-7 pt-2" aria-live="polite">
        {error ? (
          <p className="text-xs leading-5 text-red-600">
            {error}
          </p>
        ) : (
          <p className="text-xs leading-5 text-slate-500">
            {value.length} of 5 photos uploaded
          </p>
        )}
      </div>
    </div>
  );
}

export default CommunityPhotosField;
