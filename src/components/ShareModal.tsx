// components/ShareModal.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createShareLink } from "@/app/actions/share-actions";
import {
  Link2,
  Copy,
  Check,
  Calendar,
  Download,
  Lock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  document: {
    id: string;
    file_name: string;
  } | null;
  userId: string;
}

export default function ShareModal({
  open,
  onClose,
  document,
  userId,
}: ShareModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Share options
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [expiresIn, setExpiresIn] = useState<"never" | "7d" | "30d" | "custom">(
    "never",
  );
  const [customDate, setCustomDate] = useState("");
  const [maxDownloads, setMaxDownloads] = useState<number | null>(null);

  // In ShareModal component, replace the supabase insert with:
  // components/ShareModal.tsx - Update the generateShareLink function

  const generateShareLink = async () => {
    if (!document || !userId) return;

    setIsLoading(true);

    try {
      // Generate unique token
      const shareToken =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      // Calculate expiration date
      let expiresAt = null;
      if (expiresIn === "7d") {
        expiresAt = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString();
      } else if (expiresIn === "30d") {
        expiresAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString();
      } else if (expiresIn === "custom" && customDate) {
        expiresAt = new Date(customDate).toISOString();
      }

      // Hash password if provided
      let passwordHash = null;
      if (hasPassword && password) {
        passwordHash = btoa(password);
      }

      // Use server action instead of direct Supabase insert
      const result = await createShareLink({
        document_id: document.id,
        user_id: userId,
        share_token: shareToken,
        password_hash: passwordHash,
        expires_at: expiresAt,
        max_downloads: maxDownloads,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Generate full share link
      const link = `${window.location.origin}/share/${shareToken}`;
      setShareLink(link);

      toast.success("Share link created!", {
        description: "Your link has been generated successfully.",
      });
    } catch (error: any) {
      console.error("Error creating share link:", error);
      toast.error("Failed to create share link", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const resetForm = () => {
    setShareLink("");
    setHasPassword(false);
    setPassword("");
    setExpiresIn("never");
    setCustomDate("");
    setMaxDownloads(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
        </DialogHeader>

        {!shareLink ? (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm font-medium">{document?.file_name}</p>
            </div>

            {/* Password Protection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="password-protection" className="text-sm">
                  Password Protection
                </Label>
              </div>
              <Switch
                id="password-protection"
                checked={hasPassword}
                onCheckedChange={setHasPassword}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-violet-600"
                />
              </div>
            )}

            {/* Expiration */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Link Expiration</Label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "never", label: "Never" },
                  { value: "7d", label: "7 Days" },
                  { value: "30d", label: "30 Days" },
                  { value: "custom", label: "Custom" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={expiresIn === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExpiresIn(option.value as any)}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl mt-2"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {expiresIn === "custom" && (
                <Input
                  type="datetime-local"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            {/* Download Limit */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Download Limit</Label>
              </div>
              <Input
                type="number"
                placeholder="Unlimited"
                min={1}
                value={maxDownloads || ""}
                onChange={(e) =>
                  setMaxDownloads(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                className="border-violet-600"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited downloads
              </p>
            </div>

            <Button
              onClick={generateShareLink}
              disabled={isLoading || (hasPassword && !password)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              Generate Share Link
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Share Link</p>
              <p className="text-sm font-mono break-all">{shareLink}</p>
            </div>

            <Button onClick={copyToClipboard} className="w-full gap-2">
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </Button>

            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
              <p className="text-xs text-muted-foreground text-center">
                Anyone with this link can {hasPassword && "enter password and "}
                download the file
                {expiresIn !== "never" && " until the expiration date"}
                {maxDownloads && ` (max ${maxDownloads} downloads)`}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
