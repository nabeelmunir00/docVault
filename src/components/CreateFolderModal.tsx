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
import { FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  isCreating: boolean;
}

export default function CreateFolderModal({
  open,
  onClose,
  onConfirm,
  isCreating,
}: CreateFolderModalProps) {
  const [name, setName] = useState("");

  const handleClose = () => {
    setName("");
    onClose();
  };

  const handleConfirm = () => {
    if (!name.trim()) return;
    onConfirm(name.trim());
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm rounded-2xl border-border/60 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950 rounded-xl flex items-center justify-center">
                <FolderPlus className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  New Folder
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Create a folder to organize your files
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-foreground">
              Folder Name
            </label>
            <Input
              placeholder="e.g. Work, Personal, Projects..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              className="rounded-xl border-border/60"
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-xl border-border/60"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!name.trim() || isCreating}
              className={cn(
                "flex-1 rounded-xl",
                name.trim()
                  ? "bg-violet-600 hover:bg-violet-700 text-white"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FolderPlus className="w-3.5 h-3.5" />
                  Create Folder
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
