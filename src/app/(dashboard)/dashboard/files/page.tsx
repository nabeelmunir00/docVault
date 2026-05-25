"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DeleteModal from "@/components/DeleteModal";
import {
  FileText,
  ImageIcon,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
  Search,
  Files,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

// File icon helper
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

// Format size
const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function FilesPage() {
  const { user } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filtered, setFiltered] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Fetch documents
  const fetchDocuments = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDocuments(data);
      setFiltered(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  // Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(documents);
    } else {
      setFiltered(
        documents.filter((doc) =>
          doc.file_name.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, documents]);

  // Download file
  const handleDownload = async (doc: Document) => {
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.storage_path, 60);

    if (data?.signedUrl) {
      const link = document.createElement("a");
      link.href = data.signedUrl;
      link.download = doc.file_name;
      link.click();
    }
  };

  // Delete file

  const openDelete = (doc: Document) => {
    setSelectedDoc(doc);
    setDeleteModal(true);
  };
  const handleDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(selectedDoc.id);

    await supabase.storage.from("documents").remove([selectedDoc.storage_path]);

    await supabase.from("documents").delete().eq("id", selectedDoc.id);

    setDocuments((prev) => prev.filter((d) => d.id !== selectedDoc.id));
    setDeleting(null);
    setDeleteModal(false);
    setSelectedDoc(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">My Files</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All your uploaded documents in one place
        </p>
      </div>

      {/* Search + View Toggle */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-border/60"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border/60 rounded-xl overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "px-3 py-2 text-xs transition-colors",
                view === "grid"
                  ? "bg-violet-600 text-white"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              Grid
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "px-3 py-2 text-xs transition-colors",
                view === "list"
                  ? "bg-violet-600 text-white"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              List
            </button>
          </div>
          <Badge variant="secondary" className="text-xs">
            {filtered.length} files
          </Badge>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
              <Files className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {search ? "No files found" : "No files yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {search
                ? "Try a different search term"
                : "Upload your first file to get started"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {!loading && filtered.length > 0 && view === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((doc) => {
            const fileInfo = getFileInfo(doc.file_type);
            const Icon = fileInfo.icon;
            return (
              <Card
                key={doc.id}
                className="border-border/60 hover:border-violet-300 dark:hover:border-violet-700 transition-colors group"
              >
                <CardContent className="p-4 flex flex-col gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      fileInfo.bg,
                    )}
                  >
                    <Icon className={cn("w-5 h-5", fileInfo.color)} />
                  </div>

                  {/* Name */}
                  <div>
                    <p className="text-xs font-medium text-foreground truncate">
                      {doc.file_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatSize(doc.file_size)} · {formatDate(doc.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="flex-1 h-7 text-xs rounded-lg border-border/60"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Get
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDelete(doc)}
                      disabled={deleting === doc.id}
                      className="h-7 w-7 p-0 rounded-lg border-border/60 hover:border-red-300 hover:text-red-500"
                    >
                      {deleting === doc.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {!loading && filtered.length > 0 && view === "list" && (
        <Card className="border-border/60">
          <CardHeader className="px-6 py-3 border-b border-border/60">
            <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground">
              <span className="col-span-5">Name</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-2">Size</span>
              <span className="col-span-2">Uploaded</span>
              <span className="col-span-1"></span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.map((doc, index) => {
              const fileInfo = getFileInfo(doc.file_type);
              const Icon = fileInfo.icon;
              return (
                <div
                  key={doc.id}
                  className={cn(
                    "grid grid-cols-12 items-center px-6 py-3 hover:bg-muted/30 transition-colors group",
                    index !== filtered.length - 1 &&
                      "border-b border-border/40",
                  )}
                >
                  {/* Name */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                        fileInfo.bg,
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5", fileInfo.color)} />
                    </div>
                    <span className="text-sm font-medium text-foreground truncate">
                      {doc.file_name}
                    </span>
                  </div>

                  {/* Type */}
                  <div className="col-span-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {fileInfo.label}
                    </Badge>
                  </div>

                  {/* Size */}
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {formatSize(doc.file_size)}
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {formatDate(doc.created_at)}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      disabled={deleting === doc.id}
                      className="w-7 h-7 rounded-lg hover:text-red-500"
                    >
                      {deleting === doc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}
