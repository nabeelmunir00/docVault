"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Download,
  Loader2,
  FileText,
  ImageIcon,
  Video,
  File,
  Maximize2,
  Minimize2,
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
  const [isFullscreen, setIsFullscreen] = useState(false);

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

    // Reset fullscreen jab modal band ho
    if (!open) setIsFullscreen(false);
  }, [open, document]);

  // ESC se fullscreen band karo
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFullscreen, onClose]);

  if (!open || !document) return null;

  const type = document.file_type;
  const isImage = type.startsWith("image/");
  const isVideo = type.startsWith("video/");
  const isPDF = type === "application/pdf";
  const Icon = isImage ? ImageIcon : isVideo ? Video : isPDF ? FileText : File;

  const handleDownload = async () => {
    if (!url || !document) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      console.error("Download failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop — fullscreen mein click se band nahi hoga */}
      {!isFullscreen && (
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
      )}

      {/* Window */}
      <div
        className={`
          relative bg-white dark:bg-zinc-900 shadow-2xl border border-white/10
          transition-all duration-300 ease-in-out overflow-hidden
          ${
            isFullscreen
              ? "fixed inset-0 rounded-none w-screen h-screen"
              : "rounded-2xl w-[90vw] max-w-5xl h-[85vh]"
          }
        `}
      >
        {/* Top bar — macOS style */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl">
          {/* Left — Traffic lights */}
          <div className="flex items-center gap-2">
            {/* Red — Close */}
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:opacity-80 transition-opacity"
              title="Close"
            />
            {/* Yellow — Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-3 h-3 rounded-full bg-yellow-400 hover:opacity-80 transition-opacity"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            />
            {/* Green — placeholder */}
            <div className="w-3 h-3 rounded-full bg-green-500 opacity-50" />
          </div>

          {/* Center — File name */}
          <p className="text-xs font-medium text-foreground truncate max-w-[50%]">
            {document.file_name}
          </p>

          {/* Right — Actions */}
          <div className="flex items-center gap-1">
            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title="Download"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
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
            <img
              src={url}
              alt={document.file_name}
              className="max-h-full max-w-full object-contain"
            />
          )}

          {!loading && isVideo && (
            <video src={url} controls className="max-h-full max-w-full" />
          )}

          {!loading && isPDF && (
            <iframe src={url} className="w-full h-full border-none" />
          )}

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
