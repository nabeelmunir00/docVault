"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

import {
  X,
  Download,
  Loader2,
  FileText,
  ImageIcon,
  Video,
  File,
} from "lucide-react";

interface Document {
  file_name: string;
  file_type: string;
  storage_path: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  document: Document | null;
}

export default function FilePreviewModal({ open, onClose, document }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!document) return;

      setLoading(true);

      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(document.storage_path, 60 * 5);

      if (data?.signedUrl) setUrl(data.signedUrl);

      setLoading(false);
    };

    if (open) load();
  }, [open, document]);

  if (!open || !document) return null;

  const type = document.file_type;

  const isImage = type.startsWith("image/");
  const isVideo = type.startsWith("video/");
  const isPDF = type === "application/pdf";

  const Icon = isImage ? ImageIcon : isVideo ? Video : isPDF ? FileText : File;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background blur (macOS feel) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Window */}
      <div className="relative w-[90vw] max-w-5xl h-[85vh] rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl border border-white/10">
        {/* Top bar (macOS style) */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:opacity-80"
            />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>

          {/* File name */}
          <p className="text-xs font-medium truncate max-w-[60%]">
            {document.file_name}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-1 rounded-md hover:bg-white/10">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="h-[calc(100%-3rem)] flex items-center justify-center bg-zinc-100 dark:bg-black">
          {loading && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-xs">Loading preview...</p>
            </div>
          )}

          {!loading && isImage && (
            <img src={url} className="max-h-full max-w-full object-contain" />
          )}

          {!loading && isVideo && (
            <video src={url} controls className="max-h-full max-w-full" />
          )}

          {!loading && isPDF && <iframe src={url} className="w-full h-full" />}

          {!loading && !isImage && !isVideo && !isPDF && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Icon className="w-10 h-10" />
              <p className="text-sm">Preview not supported</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
