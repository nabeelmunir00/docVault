"use client";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Files,
  Database,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import UserProfileModal from "@/components/UserProfileModal";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useUser();
  const [totalFiles, setTotalFiles] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [profileModal, setProfileModal] = useState(false);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("documents")
        .select("file_size")
        .eq("user_id", user.id);

      if (data) {
        setTotalFiles(data.length);
        setTotalSize(data.reduce((acc, doc) => acc + doc.file_size, 0));
      }
    };

    fetchStats();
  }, [user]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "U";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your account information and stats
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Profile Card */}
        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-foreground">
                    {user?.fullName ?? "—"}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  >
                    <Shield className="w-2.5 h-2.5 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {user?.primaryEmailAddress?.emailAddress ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Member since {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950 rounded-xl flex items-center justify-center flex-shrink-0">
                <Files className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {totalFiles}
                </p>
                <p className="text-xs text-muted-foreground">Total Files</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 rounded-xl flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {formatSize(totalSize)}
                </p>
                <p className="text-xs text-muted-foreground">Storage Used</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Details */}
        <Card className="border-border/60">
          <CardHeader className="px-6 py-4 border-b border-border/60">
            <CardTitle className="text-sm font-medium">
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Full Name */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-border/40">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {user?.fullName ?? "—"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-border/40">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                  {user?.primaryEmailAddress?.emailAddress ?? "—"}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex-shrink-0"
              >
                Verified
              </Badge>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-border/40">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">
                  {user?.id ?? "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manage Account — Clerk */}
        <Card className="border-border/60 border-dashed">
          <CardContent className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Manage Account
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your profile, password and security settings
              </p>
            </div>
            <Button
              variant={"ghost"}
              onClick={() => setProfileModal(true)}
              className="text-xs text-violet-600 hidden sm:block  hover:text-violet-700 font-medium transition-colors"
            >
              Open settings →
            </Button>
            <Button
              variant={"ghost"}
              onClick={() => setProfileModal(true)}
              className="text-xs sm:hidden text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              <Settings />
            </Button>
          </CardContent>
        </Card>
      </div>
      <UserProfileModal
        open={profileModal}
        onClose={() => setProfileModal(false)}
      />
    </div>
  );
}
