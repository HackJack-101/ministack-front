import type { RefObject } from "react";
import { Upload, CheckCircle2, XCircle } from "lucide-react";
import type { UploadFileStatus } from "../../hooks/useS3";
import { Spinner } from "../ui/Spinner";

interface UploadZoneProps {
  selectedBucket: string;
  uploadPath: string;
  onUploadPathChange: (path: string) => void;
  uploadingFiles: UploadFileStatus[];
  isLoading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFilesSelected: (files: File[]) => void;
}

export const UploadZone = ({
  selectedBucket,
  uploadPath,
  onUploadPathChange,
  uploadingFiles,
  isLoading,
  fileInputRef,
  onFilesSelected,
}: UploadZoneProps) => (
  <div className="p-8">
    <div className="max-w-xl mx-auto space-y-6">
      <div className="space-y-2">
        <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium">
          Destination Path (Optional)
        </label>
        <div className="flex items-center bg-surface-input border border-border-default rounded-btn px-3 py-1.5 focus-within:border-blue-500/60 transition-colors">
          <span className="text-text-muted text-sm mr-1 font-mono">s3://{selectedBucket}/</span>
          <input
            type="text"
            className="bg-transparent border-none focus:ring-0 text-text-primary flex-1 p-0 outline-none text-sm font-mono"
            value={uploadPath}
            onChange={(e) => onUploadPathChange(e.target.value)}
            placeholder="path/to/directory/"
          />
        </div>
        <p className="text-xs text-text-muted">Files will be uploaded with this prefix.</p>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border border-dashed border-border-strong rounded-card p-10 text-center hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-colors group"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && onFilesSelected(Array.from(e.target.files))}
          multiple
          className="hidden"
        />
        <div className="bg-surface-elevated w-12 h-12 rounded-card flex items-center justify-center mx-auto mb-4">
          {isLoading ? (
            <Spinner size="md" color="text-blue-500" />
          ) : (
            <Upload className="w-6 h-6 text-blue-500" />
          )}
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">{isLoading ? "Uploading..." : "Click to select files"}</p>
        <p className="text-xs text-text-muted">or drag and drop · multiple files supported</p>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="bg-surface-elevated rounded-card border border-border-subtle divide-y divide-border-subtle">
          {uploadingFiles.map((file, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {file.status === "uploading" ? (
                  <Spinner size="sm" color="text-blue-500" />
                ) : file.status === "done" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                )}
                <span className="text-sm text-text-primary truncate">{file.name}</span>
              </div>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase ${
                  file.status === "done"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : file.status === "error"
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                }`}
              >
                {file.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
