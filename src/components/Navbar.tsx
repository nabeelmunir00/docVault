"use client";

import Link from "next/link";
import { Moon, Sun, Cloud } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { UserButton, useAuth } from "@clerk/nextjs";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { isSignedIn } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">
              Doc<span className="text-violet-600">Vault</span>
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="size-6 dark:hidden" />
              <Moon className="size-6 hidden dark:block" />
            </Button>

            {/* Auth UI */}
            {!isSignedIn ? (
              <Link href="/sign-in">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                  Login
                </Button>
              </Link>
            ) : (
              <UserButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
