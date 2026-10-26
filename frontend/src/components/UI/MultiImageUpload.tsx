import { useId, useState, type ChangeEvent } from "react";
import { ImagePlus, LoaderCircle, Trash2, AlertCircle } from "lucide-react";
import type { UploadedFile } from "../../types/uploadedFile";
import { uploadFile } from "../../services/uploadService";

export interface MultiImageUploadProps {
  value?: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  folder?: string;
  label?: string;
  description?: string;
  maxPhotos?: number;
  maxSizeBytes?: number;
  allowedTypes?: string[];
  className?: string;
}

export function MultiImageUpload({
  value = [],
  onChange,
  folder = "uploads/images",
  label = "Photos",
  description,
  maxPhotos = 5,
  maxSizeBytes = 5 * 1024 * 1024,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  className = "",
}: MultiImageUploadProps) {
  const inputId = useId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;

    const remainingSlots = maxPhotos - value.length;
    if (selectedFiles.length > remainingSlots) {
      setError(
        `You can upload a maximum of ${maxPhotos} photos. You can add only ${remainingSlots} more.`
      );
      event.target.value = "";
      return;
    }

    // Validate size and mimeType before upload
    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError(`"${file.name}" is not a supported image format.`);
        event.target.value = "";
        return;
      }
      if (file.size > maxSizeBytes) {
        const mb = Math.round(maxSizeBytes / (1024 * 1024));
        setError(`"${file.name}" exceeds the allowed ${mb} MB limit.`);
        event.target.value = "";
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const uploadedFiles: UploadedFile[] = [];

      for (const file of selectedFiles) {
        const uploaded = await uploadFile(file, folder);
        uploadedFiles.push(uploaded);
      }

      onChange([...value, ...uploadedFiles]);
    } catch (err: unknown) {
      console.error("Photo upload failed:", err);
      setError("Failed to upload image. Please verify your connection and try again.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor={inputId} className="block text-sm font-semibold text-slate-900">
            {label}
          </label>
          {description && (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {value.length} of {maxPhotos} photos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {value.length < maxPhotos && (
          <div>
            <input
              id={inputId}
              type="file"
              accept={allowedTypes.join(",")}
              multiple
              disabled={loading}
              onChange={handleFileChange}
              className="sr-only"
            />
            <label
              htmlFor={inputId}
              className={`flex aspect-square min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-center transition-colors ${
                loading
                  ? "cursor-wait border-blue-300 bg-blue-50"
                  : "border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50/50"
              }`}
            >
              {loading ? (
                <LoaderCircle size={22} className="animate-spin text-blue-600" />
              ) : (
                <ImagePlus size={22} className="text-blue-600" />
              )}
              <span className="mt-2 px-1 text-xs font-medium text-slate-600">
                {loading ? "Uploading..." : "Add Photo"}
              </span>
            </label>
          </div>
        )}

        {value.map((file, idx) => (
          <div
            key={file.key || idx}
            className="group relative flex aspect-square min-h-24 flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
          >
            <img
              src={file.url}
              alt={file.originalName}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="absolute bottom-1.5 left-2 right-2 truncate text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {file.originalName}
            </span>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              aria-label={`Remove ${file.originalName}`}
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-red-600 shadow-sm backdrop-blur transition-all hover:bg-white hover:text-red-700 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default MultiImageUpload;
