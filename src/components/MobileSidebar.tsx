"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Menu,
  LayoutDashboard,
  Upload,
  Files,
  Clock,
  Settings,
  User,
  Cloud,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

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

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [usedBytes, setUsedBytes] = useState(0);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const { user } = useUser();

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
  }, [user, pathname]);
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-56 p-0 flex flex-col">
        {/* ✅ SheetTitle — accessibility fix (hidden) */}
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border/60">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Cloud className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-foreground">
            Doc<span className="text-violet-600">Vault</span>
          </span>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                        isActive
                          ? "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Storage */}
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
      </SheetContent>
    </Sheet>
  );
}
