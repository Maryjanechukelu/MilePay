"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, X } from "lucide-react";
import { formatFileSize, cn } from "@/lib/utils";

interface FileUploadZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  accept?: Record<string, string[]>;
  label?: string;
  hint?: string;
  /** Single-file mode shows the selected file inline instead of a list */
  singleFile?: boolean;
}

/**
 * Reusable drag-and-drop file upload zone with a file list and remove
 * buttons. Used for ID uploads, milestone deliverables, and dispute
 * evidence across the app.
 */
export function FileUploadZone({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMb = 10,
  accept = { "image/*": [], "application/pdf": [] },
  label = "Drop files here or click to upload",
  hint,
  singleFile = false,
}: FileUploadZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (singleFile) {
        onFilesChange(accepted.slice(0, 1));
        return;
      }
      onFilesChange([...files, ...accepted].slice(0, maxFiles));
    },
    [files, maxFiles, onFilesChange, singleFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMb * 1024 * 1024,
    maxFiles: singleFile ? 1 : maxFiles,
  });

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  // Single-file mode with a file already selected — show inline confirmation
  if (singleFile && files.length > 0) {
    return (
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer border-forest-300 bg-forest-50 transition-colors"
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-center gap-2">
          <CheckCircle size={16} className="text-forest-600" />
          <span className="text-sm text-forest-700 font-medium">{files[0].name}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeFile(0); }}
            className="text-forest-400 hover:text-red-500 ml-1"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-2xs text-forest-500 mt-1">{formatFileSize(files[0].size)} · Click to replace</p>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors",
          isDragActive ? "border-forest-400 bg-forest-50" : "border-slate-200 hover:border-slate-300"
        )}
      >
        <input {...getInputProps()} />
        <Upload size={18} className="text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600 font-medium">{label}</p>
        <p className="text-xs text-slate-400 mt-1">
          {hint ?? `Images, PDFs, documents · max ${maxSizeMb}MB each${!singleFile ? ` · max ${maxFiles} files` : ""}`}
        </p>
      </div>

      {!singleFile && files.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle size={12} className="text-forest-500 flex-shrink-0" />
                <span className="text-xs text-slate-700 truncate">{f.name}</span>
                <span className="text-2xs text-slate-400 flex-shrink-0">{formatFileSize(f.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-slate-400 hover:text-red-500 ml-2 flex-shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
