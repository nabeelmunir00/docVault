"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
          {/* Logo */}
          <div
            className={cn(
              "flex items-center gap-2 group",
              collapsed ? "hidden" : "block",
            )}
          >
            <span className="text-lg font-semibold">
              Doc<span className="text-violet-600">Vault</span>
            </span>
          </div>
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

        <ScrollArea className="flex-1 px-2 py-3">
          {navItems.map((group) => (
            <div key={group.label} className="mb-5">
              {/* Group Label — hide when collapsed */}
              {!collapsed && (
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                  {group.label}
                </p>
              )}

              {/* Divider when collapsed */}
              {collapsed && <div className="h-px bg-border/60 mx-2 mb-2" />}

              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;

                  return collapsed ? (
                    // Collapsed — icon only with tooltip
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
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
                    // Expanded — full label
                    <Link
                      key={item.href}
                      href={item.href}
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
            // Collapsed storage — just icon
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center w-9 h-9 rounded-lg mx-auto bg-muted/40 cursor-default">
                  <Cloud className="w-4 h-4 text-violet-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                Storage: 3.1 GB of 5 GB (62%)
              </TooltipContent>
            </Tooltip>
          ) : (
            // Expanded storage
            <div className="bg-muted/40 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-xs font-medium text-foreground">
                    Storage
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">62%</span>
              </div>
              <Progress value={62} className="h-1.5 mb-2" />
              <p className="text-[11px] text-muted-foreground">
                3.1 GB of 5 GB used
              </p>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
