"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DeleteModal from "@/components/DeleteModal";
import UserProfileModal from "@/components/UserProfileModal";
import {
  Sun,
  Moon,
  Monitor,
  Database,
  Trash2,
  Shield,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Storage states
  const [usedBytes, setUsedBytes] = useState(0);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [profileModal, setProfileModal] = useState(false);

  const TOTAL_STORAGE = 5 * 1024 * 1024 * 1024; // 5GB in bytes

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const usedPercent = Math.min(
    Math.round((usedBytes / TOTAL_STORAGE) * 100),
    100,
  );

  const remainingBytes = TOTAL_STORAGE - usedBytes;

  // Fetch real storage
  useEffect(() => {
    const fetchStorage = async () => {
      if (!user) return;
      setLoadingStorage(true);

      const { data } = await supabase
        .from("documents")
        .select("file_size")
        .eq("user_id", user.id);

      if (data) {
        const total = data.reduce((acc, doc) => acc + (doc.file_size || 0), 0);
        setUsedBytes(total);
      }
      setLoadingStorage(false);
    };

    fetchStorage();
  }, [user]);

  // Danger zone modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete all files
  const handleDeleteAllFiles = async () => {
    if (!user) return;
    setIsDeleting(true);

    try {
      const { data: docs } = await supabase
        .from("documents")
        .select("storage_path")
        .eq("user_id", user.id);

      if (docs && docs.length > 0) {
        await supabase.storage
          .from("documents")
          .remove(docs.map((d) => d.storage_path));

        await supabase.from("documents").delete().eq("user_id", user.id);
      }

      toast.success("All files deleted!", {
        description: "Your storage has been cleared successfully.",
      });

      setUsedBytes(0);
      setDeleteModal(false);
      router.refresh();
    } catch {
      toast.error("Failed to delete files!", {
        description: "Something went wrong. Try again.",
      });
    }

    setIsDeleting(false);
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your preferences and account settings
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* ======================== */}
        {/* Appearance */}
        {/* ======================== */}
        <Card className="border-border/60">
          <CardHeader className="px-6 py-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-violet-500" />
              <CardTitle className="text-sm font-medium">Appearance</CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Choose your preferred theme
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                      isActive
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/50"
                        : "border-border/60 hover:border-border hover:bg-muted/40",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        isActive ? "text-violet-600" : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isActive ? "text-violet-600" : "text-muted-foreground",
                      )}
                    >
                      {option.label}
                    </span>
                    {isActive && (
                      <CheckCircle className="w-3 h-3 text-violet-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ======================== */}
        {/* Storage Info */}
        {/* ======================== */}
        <Card className="border-border/60">
          <CardHeader className="px-6 py-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-violet-500" />
              <CardTitle className="text-sm font-medium">
                Storage & Limits
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Your current storage usage and plan limits
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            {/* Storage Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Storage Used
                </span>
                <span className="text-xs text-muted-foreground">
                  {loadingStorage
                    ? "Loading..."
                    : `${formatSize(usedBytes)} / 5 GB`}
                </span>
              </div>
              <Progress
                value={loadingStorage ? 0 : usedPercent}
                className={cn(
                  "h-2",
                  usedPercent >= 90
                    ? "[&>div]:bg-red-500"
                    : usedPercent >= 70
                      ? "[&>div]:bg-amber-500"
                      : "",
                )}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {loadingStorage
                  ? "Calculating storage..."
                  : `${usedPercent}% used — ${formatSize(remainingBytes)} remaining`}
              </p>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Max file size",
                  value: "50 MB",
                  color: "text-violet-600",
                  bg: "bg-violet-50 dark:bg-violet-950",
                },
                {
                  label: "Total storage",
                  value: "5 GB",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50 dark:bg-emerald-950",
                },
                {
                  label: "File types",
                  value: "PDF, IMG, DOCX, XLSX",
                  color: "text-blue-600",
                  bg: "bg-blue-50 dark:bg-blue-950",
                },
                {
                  label: "Max files",
                  value: "Unlimited",
                  color: "text-amber-600",
                  bg: "bg-amber-50 dark:bg-amber-950",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "rounded-xl p-3 border border-border/40",
                    item.bg,
                  )}
                >
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={cn("text-sm font-semibold mt-0.5", item.color)}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Plan Badge */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium text-foreground">
                  Free Plan
                </span>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
              >
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* ======================== */}
        {/* Danger Zone */}
        {/* ======================== */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="px-6 py-4 border-b border-red-100 dark:border-red-900">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
                Danger Zone
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Irreversible actions — proceed with caution
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Delete All Files */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 dark:border-red-900/50">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Delete All Files
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete all your uploaded files
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModal(true)}
                className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete All
              </Button>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Delete Account
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProfileModal(true)}
                className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950 rounded-lg"
              >
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete All Files Modal */}
      <DeleteModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteAllFiles}
        fileName="All your files"
        fileType="application/pdf"
        isDeleting={isDeleting}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        open={profileModal}
        onClose={() => setProfileModal(false)}
      />
    </div>
  );
}
