"use client";

import { useState } from "react";
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
        <div className="p-3 border-t border-border/60">
          <div className="bg-muted/40 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Storage</span>
              <span className="text-[10px] text-muted-foreground">62%</span>
            </div>
            <Progress value={62} className="h-1.5 mb-2" />
            <p className="text-[11px] text-muted-foreground">
              3.1 GB of 5 GB used
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
