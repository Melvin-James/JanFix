import type { UploadedFile } from "../types/uploadedFile";

export interface UploadedFileViewProps {
  file?: UploadedFile | null;
  emptyText?: string;
  label?: string;
  className?: string;
  variant?: "link" | "button";
}

export function UploadedFileView({
  file,
  emptyText = "Not provided",
  label,
  className = "",
  variant = "link",
}: UploadedFileViewProps) {
  if (!file || !file.url) {
    return (
      <span className="text-sm text-slate-400">
        {emptyText}
      </span>
    );
  }

  const displayText = label ?? file.originalName ?? "View File";

  if (variant === "button") {
    return (
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50 transition-colors ${className}`}
      >
        {displayText}
      </a>
    );
  }

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline break-all ${className}`}
    >
      {displayText}
    </a>
  );
}

export default UploadedFileView;