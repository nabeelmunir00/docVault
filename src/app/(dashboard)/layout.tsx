"use client";

import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";

function DashboardNavbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md h-[53px] flex items-center justify-between px-6">
      {/* Left — Mobile only */}
      <div className="flex items-center gap-2 md:hidden">
        <MobileSidebar />
        <span className="font-semibold text-foreground">
          Doc<span className="text-violet-600">Vault</span>
        </span>
      </div>

      {/* Right — Theme + User */}
      <div className="flex items-center gap-4 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-8 h-8 rounded-lg"
        >
          <Sun
            className={cn(
              "h-4 w-4 transition-all",
              theme === "dark" ? "scale-0 absolute" : "scale-100",
            )}
          />
          <Moon
            className={cn(
              "h-4 w-4 transition-all",
              theme === "dark" ? "scale-100" : "scale-0 absolute",
            )}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <UserButton
          appearance={{
            elements: { avatarBox: "w-8 h-8" },
          }}
        />
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left — Sidebar fixed */}
      <Sidebar />

      {/* Right — Navbar + Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar — sirf right side mein */}
        <DashboardNavbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
