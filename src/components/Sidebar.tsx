"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Upload,
  Files,
  Clock,
  Settings,
  User,
  Cloud,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/upload", label: "Upload Files", icon: Upload },
      { href: "/dashboard/files", label: "My Files", icon: Files },
      { href: "/dashboard/recent", label: "Recent Uploads", icon: Clock },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/profile", label: "Profile", icon: User },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

const TOTAL_STORAGE = 5 * 1024 * 1024 * 1024; // 5GB in bytes

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [usedBytes, setUsedBytes] = useState(0);
  const [loadingStorage, setLoadingStorage] = useState(true);

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
  }, [user, pathname]); // pathname change pe bhi refresh

  const usedPercent = Math.min(
    Math.round((usedBytes / TOTAL_STORAGE) * 100),
    100,
  );

  const storageColor =
    usedPercent >= 90
      ? "text-red-500"
      : usedPercent >= 70
        ? "text-amber-500"
        : "text-violet-500";

  const progressColor =
    usedPercent >= 90
      ? "[&>div]:bg-red-500"
      : usedPercent >= 70
        ? "[&>div]:bg-amber-500"
        : "";

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border/60 bg-background h-[calc(100vh)] sticky top-16 transition-all duration-300 ease-in-out",
          collapsed ? "w-[60px]" : "w-56",
        )}
      >
        {/* Toggle Button */}
        <div
          className={cn(
            "flex items-center border-b border-border/60 px-3 py-3",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed && (
            <span className="text-lg font-semibold">
              Doc<span className="text-violet-600">Vault</span>
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 px-2 py-3">
          {navItems.map((group) => (
            <div key={group.label} className="mb-5">
              {!collapsed && (
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                  {group.label}
                </p>
              )}
              {collapsed && <div className="h-px bg-border/60 mx-2 mb-2" />}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;

                  return collapsed ? (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          prefetch={true}
                          className={cn(
                            "flex items-center justify-center w-9 h-9 rounded-lg mx-auto transition-all",
                            isActive
                              ? "bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      className={cn(
                        "flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-all group",
                        isActive
                          ? "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isActive
                              ? "text-violet-600 dark:text-violet-400"
                              : "text-muted-foreground group-hover:text-foreground",
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && (
                        <ChevronRight className="w-3 h-3 text-violet-500 flex-shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Storage Box */}
        <div className="p-3 border-t border-border/60">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center w-9 h-9 rounded-lg mx-auto bg-muted/40 cursor-default">
                  <Cloud className={cn("w-4 h-4", storageColor)} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                Storage: {formatSize(usedBytes)} of 5 GB ({usedPercent}%)
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="bg-muted/40 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cloud className={cn("w-3.5 h-3.5", storageColor)} />
                  <span className="text-xs font-medium text-foreground">
                    Storage
                  </span>
                </div>
                <span className={cn("text-[10px] font-medium", storageColor)}>
                  {loadingStorage ? "..." : `${usedPercent}%`}
                </span>
              </div>
              <Progress
                value={loadingStorage ? 0 : usedPercent}
                className={cn("h-1.5 mb-2", progressColor)}
              />
              <p className="text-[11px] text-muted-foreground">
                {loadingStorage
                  ? "Loading..."
                  : `${formatSize(usedBytes)} of 5 GB used`}
              </p>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
