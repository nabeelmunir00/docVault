"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Cloud,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  File,
  CheckCircle,
  XCircle,
  X,
  UploadCloud,
} from "lucide-react";

// File types
const FILE_ICONS: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  "application/pdf": {
    icon: FileText,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950",
  },
  "image/png": {
    icon: ImageIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  "image/jpeg": {
    icon: ImageIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  "image/jpg": {
    icon: ImageIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    icon: FileSpreadsheet,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950",
  },
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

type FileStatus = "pending" | "uploading" | "done" | "error";

interface FileItem {
  file: File;
  progress: number;
  status: FileStatus;
  error?: string;
}

interface UploadZoneProps {
  onUploadComplete?: () => void;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const { user } = useUser();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: "pending" as FileStatus,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: uploading,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!user || files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "done") continue;

      const { file } = files[i];
      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading", progress: 10 } : f,
        ),
      );

      try {
        const { error: storageError } = await supabase.storage
          .from("documents")
          .upload(filePath, file, { upsert: false });

        if (storageError) throw storageError;

        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: 70 } : f)),
        );

        const { error: dbError } = await supabase.from("documents").insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
        });

        if (dbError) throw new Error(dbError.message);

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "done", progress: 100 } : f,
          ),
        );

        // ✅ Success toast
        toast.success("File uploaded!", {
          description: `${file.name} has been uploaded successfully.`,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: "error", error: message, progress: 0 }
              : f,
          ),
        );

        // ❌ Error toast
        toast.error("Upload failed!", {
          description: `${file.name} could not be uploaded.`,
        });
      }
    }

    setUploading(false);
    onUploadComplete?.();
  };

  const clearDone = () => {
    setFiles((prev) => prev.filter((f) => f.status !== "done"));
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 scale-[1.01]"
            : "border-border hover:border-violet-400 hover:bg-muted/40",
          uploading && "opacity-50 cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
              isDragActive ? "bg-violet-100 dark:bg-violet-900" : "bg-muted",
            )}
          >
            <UploadCloud
              className={cn(
                "w-7 h-7 transition-colors",
                isDragActive ? "text-violet-600" : "text-muted-foreground",
              )}
            />
          </div>
          {isDragActive ? (
            <p className="text-sm font-medium text-violet-600">Drop Here!</p>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drag & drop your files here, or{" "}
                  <span className="text-violet-600 underline underline-offset-2">
                    browse
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, PNG, JPG, DOCX, XLSX — max 50MB per file
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-medium text-foreground">
              Files ({files.length})
            </p>
            {doneCount > 0 && (
              <button
                onClick={clearDone}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear done
              </button>
            )}
          </div>

          {/* File Items */}
          {files.map((item, index) => {
            const fileInfo = FILE_ICONS[item.file.type] || {
              icon: File,
              color: "text-muted-foreground",
              bg: "bg-muted",
            };
            const Icon = fileInfo.icon;

            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20"
              >
                {/* File Icon */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    fileInfo.bg,
                  )}
                >
                  <Icon className={cn("w-4 h-4", fileInfo.color)} />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-medium text-foreground truncate">
                      {item.file.name}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] px-1.5 py-0 flex-shrink-0",
                        item.status === "done" &&
                          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                        item.status === "error" &&
                          "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                        item.status === "uploading" &&
                          "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
                        item.status === "pending" &&
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.status === "done" && "Done"}
                      {item.status === "error" && "Error"}
                      {item.status === "uploading" && "Uploading"}
                      {item.status === "pending" && formatSize(item.file.size)}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <Progress
                    value={item.progress}
                    className={cn(
                      "h-1",
                      item.status === "done" && "[&>div]:bg-emerald-500",
                      item.status === "error" && "[&>div]:bg-red-500",
                    )}
                  />

                  {/* Error message */}
                  {item.status === "error" && item.error && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {item.error}
                    </p>
                  )}
                </div>

                {/* Status Icon / Remove */}
                <div className="flex-shrink-0">
                  {item.status === "done" && (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  )}
                  {item.status === "error" && (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  {item.status === "pending" && (
                    <button onClick={() => removeFile(index)}>
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  )}
                  {item.status === "uploading" && (
                    <Cloud className="w-4 h-4 text-violet-500 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Upload Button */}
          {pendingCount > 0 && (
            <Button
              onClick={uploadFiles}
              disabled={uploading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl mt-1"
            >
              {uploading ? (
                <>
                  <Cloud className="w-4 h-4 mr-2 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Upload {pendingCount} file{pendingCount > 1 ? "s" : ""}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
