import { MultiImageUpload } from "../../../components/UI/MultiImageUpload";
import type { UploadedFile } from "../../../types/uploadedFile";

export interface CommunityPhotosFieldProps {
  value?: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}

export function CommunityPhotosField({
  value = [],
  onChange,
}: CommunityPhotosFieldProps) {
  return (
    <MultiImageUpload
      value={value}
      onChange={onChange}
      folder="provider/community-photos"
      label="Previous Community Work"
      description="Upload up to 5 photos showing your previous community work."
      maxPhotos={5}
    />
  );
}

export default CommunityPhotosField;
