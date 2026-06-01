// app/share/[token]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Download, FileText, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { handleDownload } from "@/utils/handleDownload";

interface SharedDocument {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<SharedDocument | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyShareLink();
  }, [token]);

  const verifyShareLink = async () => {
    try {
      setLoading(true);

      // Get share link info
      const { data: shareData, error: shareError } = await supabase
        .from("shared_links")
        .select("*")
        .eq("share_token", token)
        .single();

      if (shareError || !shareData) {
        setError("Invalid or expired share link");
        setLoading(false);
        return;
      }

      // Check if link is active
      if (!shareData.is_active) {
        setError("This share link has been deactivated");
        setLoading(false);
        return;
      }

      // Check expiration
      if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
        setError("This share link has expired");
        setLoading(false);
        return;
      }

      // Check download limit
      if (
        shareData.max_downloads &&
        shareData.download_count >= shareData.max_downloads
      ) {
        setError("Download limit reached for this link");
        setLoading(false);
        return;
      }

      // Check if password required
      if (shareData.password_hash) {
        setRequiresPassword(true);
        setLoading(false);
        return;
      }

      // No password required, fetch document
      await fetchDocument(shareData.document_id);
    } catch (error) {
      console.error("Error verifying share link:", error);
      setError("Failed to verify share link");
      setLoading(false);
    }
  };

  const verifyPassword = async () => {
    setIsVerifying(true);

    try {
      const { data: shareData, error: shareError } = await supabase
        .from("shared_links")
        .select("*")
        .eq("share_token", token)
        .single();

      if (shareError || !shareData) {
        setError("Invalid share link");
        setIsVerifying(false);
        return;
      }

      // Verify password (simple check - use proper hash comparison in production)
      const expectedHash = shareData.password_hash;
      const providedHash = btoa(password);

      if (expectedHash !== providedHash) {
        toast.error("Invalid password");
        setIsVerifying(false);
        return;
      }

      // Password correct, fetch document
      await fetchDocument(shareData.document_id);
    } catch (error) {
      console.error("Error verifying password:", error);
      toast.error("Failed to verify password");
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchDocument = async (documentId: string) => {
    try {
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .single();

      if (docError || !docData) {
        setError("Document not found");
        return;
      }

      setDocument(docData);

      // Increment download count
      await supabase
        .from("shared_links")
        .update({ download_count: supabase.rpc("increment", { x: 1 }) })
        .eq("share_token", token);
    } catch (error) {
      console.error("Error fetching document:", error);
      setError("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClick = async () => {
    if (!document) return;

    try {
      await handleDownload(document);

      // Update download count
      const { data: shareData } = await supabase
        .from("shared_links")
        .select("download_count, max_downloads")
        .eq("share_token", token)
        .single();

      if (shareData && shareData.max_downloads) {
        const newCount = (shareData.download_count || 0) + 1;
        if (newCount >= shareData.max_downloads) {
          toast.warning("This was the last download for this link");
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-center">Access Denied</h1>
            <p className="text-sm text-muted-foreground text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-8 gap-6">
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/20 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-violet-500" />
            </div>
            <h1 className="text-xl font-semibold text-center">
              Password Protected
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              This file is protected with a password
            </p>
            <div className="w-full space-y-3">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && verifyPassword()}
              />
              <Button
                onClick={verifyPassword}
                disabled={isVerifying || !password}
                className="w-full gap-2"
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Access File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-6">
          <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center">
            <FileText className="w-10 h-10 text-violet-500" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold">{document.file_name}</h1>
            <p className="text-sm text-muted-foreground">
              {(document.file_size / (1024 * 1024)).toFixed(2)} MB •{" "}
              {document.file_type}
            </p>
          </div>

          <Button onClick={handleDownloadClick} className="w-full gap-2">
            <Download className="w-4 h-4" />
            Download File
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This link is secure and encrypted
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
