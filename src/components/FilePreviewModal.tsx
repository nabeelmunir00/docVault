"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Loader2,
  FileText,
  ImageIcon,
  Video,
  FileSpreadsheet,
  File,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  file_size?: number;
}

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  document: Document | null;
}

const getFileInfo = (type: string) => {
  if (type === "application/pdf")
    return {
      icon: FileText,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950",
      label: "PDF",
    };

  if (type.startsWith("image/"))
    return {
      icon: ImageIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950",
      label: "Image",
    };

  if (type.startsWith("video/"))
    return {
      icon: Video,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950",
      label: "Video",
    };

  if (type.includes("spreadsheet") || type.includes("excel"))
    return {
      icon: FileSpreadsheet,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950",
      label: "Excel",
    };

  if (type.includes("word") || type.includes("document"))
    return {
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950",
      label: "Word",
    };

  return {
    icon: File,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "File",
  };
};

const formatSize = (bytes?: number) => {
  if (!bytes) return "";

  if (bytes < 1024) return bytes + " B";

  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";

  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export default function FilePreviewModal({
  open,
  onClose,
  document,
}: FilePreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generatePreview = async () => {
      if (!document || !open) return;

      setLoading(true);

      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(document.storage_path, 60 * 5);

      if (!error && data?.signedUrl) {
        setPreviewUrl(data.signedUrl);
      }

      setLoading(false);
    };

    generatePreview();
  }, [document, open]);

  useEffect(() => {
    if (!open) {
      setPreviewUrl("");
    }
  }, [open]);

  if (!document) return null;

  const fileInfo = getFileInfo(document.file_type);
  const Icon = fileInfo.icon;

  const isImage = document.file_type.startsWith("image/");
  const isVideo = document.file_type.startsWith("video/");
  const isPDF = document.file_type === "application/pdf";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full p-0 overflow-hidden border-border/60">
        {/* Header */}
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                fileInfo.bg,
              )}
            >
              <Icon className={cn("w-5 h-5", fileInfo.color)} />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold truncate">
                {document.file_name}
              </DialogTitle>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {fileInfo.label}
                </span>

                {document.file_size && (
                  <>
                    <span className="text-muted-foreground text-xs">•</span>

                    <span className="text-xs text-muted-foreground">
                      {formatSize(document.file_size)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div className="relative w-full h-[75vh] bg-muted/20 flex items-center justify-center">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />

              <p className="text-sm text-muted-foreground">
                Loading preview...
              </p>
            </div>
          )}

          {/* Image Preview */}
          {!loading && isImage && previewUrl && (
            <img
              src={previewUrl}
              alt={document.file_name}
              className="max-w-full max-h-full object-contain"
            />
          )}

          {/* Video Preview */}
          {!loading && isVideo && previewUrl && (
            <video
              src={previewUrl}
              controls
              className="w-full h-full object-contain bg-black"
            />
          )}

          {/* PDF Preview */}
          {!loading && isPDF && previewUrl && (
            <iframe src={previewUrl} className="w-full h-full" />
          )}

          {/* Unsupported */}
          {!loading && !isImage && !isVideo && !isPDF && (
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center",
                  fileInfo.bg,
                )}
              >
                <Icon className={cn("w-8 h-8", fileInfo.color)} />
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">
                  Preview not available
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  This file type cannot be previewed directly.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
