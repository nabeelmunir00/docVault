"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DeleteModal from "@/components/DeleteModal";
import CreateFolderModal from "@/components/CreateFolderModal";
import FilePreviewModal from "@/components/FilePreviewModal";
import { handleDownload } from "@/utils/handleDownload";
import { Eye, MoreVertical, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
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
  Video,
  Folder,
  FolderOpen,
  FolderPlus,
  ChevronRight,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import UploadZone from "@/components/UploadZone";

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
  folder_id: string | null;
}

interface FolderItem {
  id: string;
  name: string;
  created_at: string;
}

// Folder Delete Modal Component
function FolderDeleteModal({
  open,
  onClose,
  onConfirm,
  folderName,
  isDeleting,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  folderName: string;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-foreground">
              Are you sure you want to delete folder{" "}
              <span className="font-semibold">"{folderName}"</span>?
            </p>
            <p className="text-xs text-muted-foreground">
              All files inside this folder will be moved to the root directory.
              The folder itself will be permanently deleted.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Folder
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
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
  if (type.startsWith("video/"))
    return {
      icon: Video,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950",
      label: "Video",
    };
  return {
    icon: File,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "File",
  };
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

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
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [filtered, setFiltered] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [uploadModal, setUploadModal] = useState(false);

  // Folder states
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
  const [createFolderModal, setCreateFolderModal] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Delete states for files
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Delete states for folders
  const [folderDeleteModal, setFolderDeleteModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);

  // Preview states
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<Document | null>(
    null,
  );

  // Fetch folders
  const fetchFolders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setFolders(data);
  };

  // Fetch documents
  const fetchDocuments = async () => {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (currentFolder) {
      query = query.eq("folder_id", currentFolder.id);
    } else {
      query = query.is("folder_id", null);
    }

    const { data, error } = await query;

    if (!error && data) {
      setDocuments(data);
      setFiltered(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchFolders();
      fetchDocuments();
    }
  }, [user, currentFolder]);

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

  // Create folder
  const handleCreateFolder = async (name: string) => {
    if (!user) return;
    setIsCreatingFolder(true);

    const { data, error } = await supabase
      .from("folders")
      .insert({ user_id: user.id, name })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create folder!");
    } else {
      setFolders((prev) => [data, ...prev]);
      toast.success("Folder created!", {
        description: `"${name}" folder has been created.`,
      });
    }

    setIsCreatingFolder(false);
    setCreateFolderModal(false);
  };

  // Open folder delete modal
  const openFolderDelete = (folder: FolderItem) => {
    setSelectedFolder(folder);
    setFolderDeleteModal(true);
  };

  // Delete folder with confirmation
  const handleDeleteFolder = async () => {
    if (!selectedFolder || !user) return;
    setIsDeletingFolder(true);

    try {
      // First, move all files in this folder to root
      const { data: filesInFolder } = await supabase
        .from("documents")
        .select("id")
        .eq("folder_id", selectedFolder.id);

      if (filesInFolder && filesInFolder.length > 0) {
        await supabase
          .from("documents")
          .update({ folder_id: null })
          .eq("folder_id", selectedFolder.id);

        toast.info(`Moved ${filesInFolder.length} file(s) to root directory`);
      }

      // Delete the folder
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", selectedFolder.id);

      if (error) {
        throw error;
      }

      setFolders((prev) => prev.filter((f) => f.id !== selectedFolder.id));
      toast.success("Folder deleted!", {
        description: `"${selectedFolder.name}" has been deleted. Files were moved to root.`,
      });
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder!", {
        description:
          "There was an error deleting the folder. Please try again.",
      });
    } finally {
      setIsDeletingFolder(false);
      setFolderDeleteModal(false);
      setSelectedFolder(null);
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
    }

    setDeleting(null);
    setDeleteModal(false);
    setSelectedDoc(null);
  };

  // Preview
  const openPreview = (doc: Document) => {
    setSelectedPreviewDoc(doc);
    setPreviewModal(true);
  };

  if (!user) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm font-medium text-foreground">
              Please sign in to view your files
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Files</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All your uploaded documents in one place
          </p>
        </div>

        {/* Upload Button */}
        <Button
          onClick={() => setUploadModal(true)}
          className="rounded-xl gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload File
        </Button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-4 text-sm">
        <button
          onClick={() => setCurrentFolder(null)}
          className={cn(
            "flex items-center gap-1 transition-colors",
            !currentFolder
              ? "text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Home className="w-3.5 h-3.5" />
          My Files
        </button>
        {currentFolder && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-violet-500" />
              {currentFolder.name}
            </span>
          </>
        )}
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

        <div className="flex items-center gap-3">
          {/* New Folder — only in root */}
          {!currentFolder && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateFolderModal(true)}
              className="rounded-xl border-border/60 gap-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </Button>
          )}

          {/* View Toggle */}
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

      {!loading && (
        <>
          {/* Folders — only in root */}
          {!currentFolder && folders.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-widest">
                Folders
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => setCurrentFolder(folder)}
                    className="group relative flex flex-col gap-2 p-4 rounded-xl border border-border/60 hover:border-violet-300 dark:hover:border-violet-700 bg-background cursor-pointer transition-all"
                  >
                    <FolderOpen className="w-8 h-8 text-violet-500" />
                    <p className="text-xs font-medium text-foreground truncate">
                      {folder.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(folder.created_at)}
                    </p>
                    {/* Delete folder button with modal trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openFolderDelete(folder);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center sm:opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files label */}
          {filtered.length > 0 && (
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-widest">
              Files
            </p>
          )}

          {/* Empty State */}
          {filtered.length === 0 && (currentFolder || folders.length === 0) && (
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
                    : currentFolder
                      ? "Upload files to this folder using the upload button"
                      : "Create a folder or upload your first file to get started"}
                </p>
                {!search && !currentFolder && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateFolderModal(true)}
                      className="gap-1"
                    >
                      <FolderPlus className="w-3 h-3" />
                      Create Folder
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setUploadModal(true)}
                      className="gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      Upload File
                    </Button>
                  </div>
                )}
                {!search && currentFolder && (
                  <Button
                    size="sm"
                    onClick={() => setUploadModal(true)}
                    className="gap-1 mt-2"
                  >
                    <Upload className="w-3 h-3" />
                    Upload to this folder
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Grid View */}
          {filtered.length > 0 && view === "grid" && (
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
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          fileInfo.bg,
                        )}
                      >
                        <Icon className={cn("w-5 h-5", fileInfo.color)} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground truncate">
                          {doc.file_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatSize(doc.file_size)} ·{" "}
                          {formatDate(doc.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
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
                          onClick={() => openPreview(doc)}
                          className="h-7 w-7 p-0 rounded-lg border-border/60"
                        >
                          <Eye className="w-3 h-3" />
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
          {filtered.length > 0 && view === "list" && (
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
                      <div className="col-span-2">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {fileInfo.label}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-xs text-muted-foreground">
                        {formatSize(doc.file_size)}
                      </div>
                      <div className="col-span-2 text-xs text-muted-foreground">
                        {formatDate(doc.created_at)}
                      </div>

                      {/* Desktop actions */}
                      <div className="hidden md:flex col-span-1 items-center justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
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
                          onClick={() => openPreview(doc)}
                          className="w-7 h-7 rounded-lg hover:text-violet-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
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

                      {/* Mobile actions */}
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
                              <Download className="w-4 h-4 mr-2" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openPreview(doc)}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" /> Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDelete(doc)}
                              disabled={deleting === doc.id}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              {deleting === doc.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                              )}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modals */}
      <CreateFolderModal
        open={createFolderModal}
        onClose={() => setCreateFolderModal(false)}
        onConfirm={handleCreateFolder}
        isCreating={isCreatingFolder}
      />

      {/* File Delete Modal */}
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

      {/* Folder Delete Modal */}
      <FolderDeleteModal
        open={folderDeleteModal}
        onClose={() => {
          setFolderDeleteModal(false);
          setSelectedFolder(null);
        }}
        onConfirm={handleDeleteFolder}
        folderName={selectedFolder?.name ?? ""}
        isDeleting={isDeletingFolder}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        open={previewModal}
        onClose={() => {
          setPreviewModal(false);
          setSelectedPreviewDoc(null);
        }}
        document={selectedPreviewDoc}
      />

      {/* File Upload Modal */}
      <Dialog open={uploadModal} onOpenChange={setUploadModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <UploadZone
            onUploadComplete={() => {
              fetchDocuments();
              fetchFolders();
              setUploadModal(false);
            }}
            folders={folders}
            currentFolderId={currentFolder?.id || null}
            showFolderSelector={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
