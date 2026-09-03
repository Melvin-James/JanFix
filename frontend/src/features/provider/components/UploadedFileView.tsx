import type { UploadedFile } from "../types/uploadedFile";

interface UploadedFileViewProps{
    file?: UploadedFile;
}

function UploadedFileView({
    file,
}: UploadedFileViewProps){

    if(!file){
        return(
            <span className="text-sm text-slate-400">
                Not uploaded
            </span>
        );
    }

    return(
        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
            {file.originalName}
        </a>
    );
}

export default UploadedFileView;