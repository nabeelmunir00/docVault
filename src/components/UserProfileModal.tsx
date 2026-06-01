"use client";

import { UserProfile } from "@clerk/nextjs";
import { X } from "lucide-react";
import { useEffect } from "react";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileModal({
  open,
  onClose,
}: UserProfileModalProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEsc);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative   max-h-[90vh] overflow-hidden rounded-xl border border-border/60 bg-background shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Clerk UserProfile */}
          <UserProfile />
        </div>
      </div>
    </>
  );
}
