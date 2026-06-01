"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  ImageIcon,
  FileSpreadsheet,
  File,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName: string;
  fileType: string;
  isDeleting: boolean;
}

const getFileInfo = (type: string) => {
  if (type === "application/pdf")
    return {
      icon: FileText,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950",
    };
  if (type.startsWith("image/"))
    return {
      icon: ImageIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    };
  if (type.includes("spreadsheet") || type.includes("excel"))
    return {
      icon: FileSpreadsheet,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950",
    };
  if (type.includes("word") || type.includes("document"))
    return {
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950",
    };
  return { icon: File, color: "text-muted-foreground", bg: "bg-muted" };
};

export default function DeleteModal({
  open,
  onClose,
  onConfirm,
  fileName,
  fileType,
  isDeleting,
}: DeleteModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText === "sure";
  const fileInfo = getFileInfo(fileType);
  const Icon = fileInfo.icon;

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const handleConfirm = () => {
    if (!isConfirmed) return;
    onConfirm();
    setConfirmText("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md md:max-w-lg rounded-2xl border-border/60 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Warning Icon */}
              <div className="w-10 h-10 bg-red-50 dark:bg-red-950 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  Delete File
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* File Name Card */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/30">
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                fileInfo.bg,
              )}
            >
              <Icon className={cn("w-4 h-4", fileInfo.color)} />
            </div>
            <p className="text-sm font-medium text-foreground truncate">
              {fileName}
            </p>
          </div>

          {/* Description */}
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 rounded-xl px-4 py-3">
            <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
              This file will be <strong>permanently deleted</strong> from your
              storage and cannot be recovered. All shared links for this file
              will also stop working.
            </p>
          </div>

          {/* Confirm Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-foreground">
              Type{" "}
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-red-500">
                sure
              </span>{" "}
              to confirm deletion
            </label>
            <Input
              placeholder="Type sure here..."
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={cn(
                "rounded-xl border-border/60 text-sm transition-colors",
                confirmText.length > 0 &&
                  !isConfirmed &&
                  "border-red-300 focus-visible:ring-red-200",
                isConfirmed &&
                  "border-emerald-300 focus-visible:ring-emerald-200",
              )}
            />
            {confirmText.length > 0 && !isConfirmed && (
              <p className="text-[11px] text-red-500">
                Please type <strong>sure</strong> exactly
              </p>
            )}
            {isConfirmed && (
              <p className="text-[11px] text-emerald-600">
                ✓ Confirmed — you can now delete
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-xl border-border/60"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isConfirmed || isDeleting}
              className={cn(
                "flex-1 rounded-xl transition-all",
                isConfirmed
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete File
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
