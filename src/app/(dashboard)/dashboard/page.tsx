"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Files, Database, Upload, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RecentUploadsTable from "@/components/RecentUploadsTable";

// Skeleton component install karo agar nahi hai
// npx shadcn@latest add skeleton

interface Stats {
  totalFiles: number;
  storageUsed: number;
  uploadsToday: number;
}

const TOTAL_STORAGE = 5 * 1024 * 1024 * 1024; // 5GB

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};

export default function DashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<Stats>({
    totalFiles: 0,
    storageUsed: 0,
    uploadsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setLoading(true);

      // Today ka start time
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // All documents fetch karo
      const { data: allDocs } = await supabase
        .from("documents")
        .select("file_size, created_at")
        .eq("user_id", user.id);

      if (allDocs) {
        // Total files
        const totalFiles = allDocs.length;

        // Storage used
        const storageUsed = allDocs.reduce(
          (acc, doc) => acc + (doc.file_size || 0),
          0,
        );

        // Uploads today
        const uploadsToday = allDocs.filter(
          (doc) => new Date(doc.created_at) >= todayStart,
        ).length;

        setStats({ totalFiles, storageUsed, uploadsToday });
      }

      setLoading(false);
    };

    fetchStats();
  }, [user]);

  const storagePercent = Math.min(
    Math.round((stats.storageUsed / TOTAL_STORAGE) * 100),
    100,
  );

  const statCards = [
    {
      label: "Total Files",
      value: loading ? null : `${stats.totalFiles}`,
      sub: loading
        ? null
        : stats.totalFiles === 0
          ? "No files yet"
          : "All uploaded files",
      icon: Files,
      color: "text-violet-500",
      bg: "bg-violet-50 dark:bg-violet-950",
    },
    {
      label: "Storage Used",
      value: loading ? null : formatSize(stats.storageUsed),
      sub: loading ? null : `${storagePercent}% of 5 GB`,
      icon: Database,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "Uploads Today",
      value: loading ? null : `${stats.uploadsToday}`,
      sub: loading
        ? null
        : stats.uploadsToday === 0
          ? "No uploads today"
          : "Files uploaded today",
      icon: Upload,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Storage Free",
      value: loading ? null : formatSize(TOTAL_STORAGE - stats.storageUsed),
      sub: loading ? null : `${100 - storagePercent}% remaining`,
      icon: Link2,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! Here's
          what's happening with your files.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.bg}`}
                >
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {loading ? (
                <>
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.sub}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Files */}
      <Card className="border-border/60">
        <CardHeader className="px-6 py-4 border-b border-border/60">
          <CardTitle className="text-sm font-medium">Recent Files</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <RecentUploadsTable limit={5} showHeader={true} autoRefresh={false} />
        </CardContent>
      </Card>
    </div>
  );
}
