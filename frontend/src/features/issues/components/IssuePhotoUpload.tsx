import { MultiImageUpload, type MultiImageUploadProps } from "../../../components/UI/MultiImageUpload";
import type { UploadedFile } from "../../../types/uploadedFile";

export interface IssuePhotoUploadProps {
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  maxPhotos?: number;
  maxSizeBytes?: number;
}

export function IssuePhotoUpload({
  value,
  onChange,
  maxPhotos = 5,
  maxSizeBytes = 5 * 1024 * 1024,
}: IssuePhotoUploadProps) {
  return (
    <MultiImageUpload
      value={value}
      onChange={onChange}
      folder="issues/images"
      label="Photos of the Issue"
      maxPhotos={maxPhotos}
      maxSizeBytes={maxSizeBytes}
    />
  );
}

export default IssuePhotoUpload;
