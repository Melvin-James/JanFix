import {
  useId,
  useState,
  type ChangeEvent,
} from "react";

import {
  CheckCircle2,
  FileText,
  UploadCloud,
} from "lucide-react";

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
  const inputId = useId();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const uploadedFile = await uploadFile(file, folder);

      onChange(uploadedFile);
    } catch (error) {
      console.error(error);
      setError("Failed to upload file");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="min-w-0">
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={inputId}
        type="file"
        onChange={handleFileChange}
        disabled={loading}
        className="sr-only"
      />

      <label
        htmlFor={inputId}
        className={`mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-5 text-center transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
          loading
            ? "cursor-wait border-blue-300 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-blue-600 shadow-sm">
          {value ? (
            <FileText size={18} aria-hidden="true" />
          ) : (
            <UploadCloud size={18} aria-hidden="true" />
          )}
        </span>

        <span className="mt-2 text-xs font-medium text-slate-700">
          {loading
            ? "Uploading..."
            : value
              ? "Choose another file"
              : "Click to browse or upload"}
        </span>

        <span className="mt-1 text-xs text-slate-500">
          Select a file from your device
        </span>
      </label>

      <div className="min-h-7 pt-2" aria-live="polite">
        {error ? (
          <p className="text-xs leading-5 text-red-600">
            {error}
          </p>
        ) : value && !loading ? (
          <p className="flex min-w-0 items-center gap-2 text-xs leading-5 text-green-700">
            <CheckCircle2
              size={15}
              className="shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{value.originalName}</span>
          </p>
        ) : (
          <p className="text-xs leading-5 text-transparent">
            No file selected
          </p>
        )}
      </div>
    </div>
  );
}

export default FileUploadField;
