"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ImageIcon,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
  Clock,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import DeleteModal from "@/components/DeleteModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
export interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

// Helpers
export const getFileInfo = (type: string) => {
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

export const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export const timeAgo = (date: string) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
};

// Props
interface RecentUploadsTableProps {
  limit?: number;
  showHeader?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  activeRoute?: string;
  onDeleteSuccess?: () => void;
}

export default function RecentUploadsTable({
  limit = 5,
  showHeader = true,
  autoRefresh = true,
  refreshInterval = 30000,
  activeRoute,
  onDeleteSuccess,
}: RecentUploadsTableProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [, setTick] = useState(0);

  // Fetch latest N uploads
  const fetchRecent = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && data) setDocuments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecent();
  }, [user]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    if (activeRoute && pathname !== activeRoute) return;

    const interval = setInterval(() => {
      fetchRecent();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [user, pathname, autoRefresh, activeRoute, refreshInterval]);

  // Live time tick
  useEffect(() => {
    if (activeRoute && pathname !== activeRoute) return;

    const tick = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(tick);
  }, [pathname, activeRoute]);

  // Download
  const handleDownload = async (doc: Document) => {
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.storage_path, 60);

    if (data?.signedUrl) {
      const link = document.createElement("a");
      link.href = data.signedUrl;
      link.download = doc.file_name;
      link.click();
      toast.success("Download started!", {
        description: `${doc.file_name} is being downloaded.`,
      });
    } else {
      toast.error("Download failed!", {
        description: "Could not generate download link.",
      });
    }
  };

  // Delete
  const openDelete = (doc: Document) => {
    setSelectedDoc(doc);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(selectedDoc.id);

    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([selectedDoc.storage_path]);

    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", selectedDoc.id);

    if (storageError || dbError) {
      toast.error("Delete failed!", {
        description: "Could not delete the file. Try again.",
      });
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== selectedDoc.id));
      toast.success("File deleted!", {
        description: `${selectedDoc.file_name} has been permanently deleted.`,
      });
      onDeleteSuccess?.();
    }

    setDeleting(null);
    setDeleteModal(false);
    setSelectedDoc(null);
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
      </div>
    );
  }

  // Empty
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No uploads yet</p>
        <p className="text-xs text-muted-foreground">
          Your recent uploads will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        {/* Table Header */}
        {showHeader && (
          <div className="grid grid-cols-12 px-4 py-2 border-b border-border/40 bg-muted/20 rounded-t-xl">
            <span className="col-span-5 text-xs font-medium text-muted-foreground">
              Name
            </span>
            <span className="col-span-2 text-xs font-medium text-muted-foreground">
              Type
            </span>
            <span className="col-span-2 text-xs font-medium text-muted-foreground">
              Size
            </span>
            <span className="col-span-2 text-xs font-medium text-muted-foreground">
              Time
            </span>
            <span className="col-span-1" />
          </div>
        )}

        {/* Rows */}
        {documents.map((doc, index) => {
          const fileInfo = getFileInfo(doc.file_type);
          const Icon = fileInfo.icon;

          return (
            <div
              key={doc.id}
              className={cn(
                "grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/30 transition-colors group",
                index !== documents.length - 1 && "border-b border-border/40",
              )}
            >
              {/* Name */}
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    fileInfo.bg,
                  )}
                >
                  <Icon className={cn("w-4 h-4", fileInfo.color)} />
                </div>
                <p className="text-sm font-medium text-foreground truncate">
                  {doc.file_name}
                </p>
              </div>

              {/* Type */}
              <div className="col-span-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {fileInfo.label}
                </Badge>
              </div>

              {/* Size */}
              <div className="col-span-2 text-xs text-muted-foreground">
                {formatSize(doc.file_size)}
              </div>

              {/* Time */}
              <div className="col-span-2">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
                  {timeAgo(doc.created_at)}
                </span>
              </div>

              {/* Actions - Desktop (visible on md and above) */}
              <div className="hidden md:flex col-span-1 items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(doc)}
                  className="w-7 h-7 rounded-lg hover:text-violet-600"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openDelete(doc)}
                  className="w-7 h-7 rounded-lg hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Actions - Mobile (visible only on mobile) */}
              <div className="md:hidden col-span-1 flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 rounded-lg"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => handleDownload(doc)}
                      className="cursor-pointer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDelete(doc)}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedDoc(null);
        }}
        onConfirm={handleDelete}
        fileName={selectedDoc?.file_name ?? ""}
        fileType={selectedDoc?.file_type ?? ""}
        isDeleting={deleting === selectedDoc?.id}
      />
    </>
  );
}
