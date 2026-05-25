import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Files, Database, Upload, Link2, Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    label: "Total Files",
    value: "148",
    sub: "+12 this week",
    icon: Files,
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950",
  },
  {
    label: "Storage Used",
    value: "3.1 GB",
    sub: "62% of 5 GB",
    icon: Database,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  {
    label: "Uploads Today",
    value: "9",
    sub: "+3 vs yesterday",
    icon: Upload,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    label: "Shared Links",
    value: "24",
    sub: "6 active",
    icon: Link2,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your files.
        </p>

        {/* Theme Toggle */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.bg}`}
                >
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Files placeholder */}
      <Card className="border-border/60">
        <CardHeader className="px-6 py-4 border-b border-border/60">
          <CardTitle className="text-sm font-medium">Recent Files</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              <Files className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No files yet</p>
            <p className="text-xs text-muted-foreground">
              Upload your first file to get started
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
