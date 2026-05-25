import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import RecentUploadsTable from "@/components/RecentUploadsTable";

export default function RecentPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Recent Uploads
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your latest 5 uploaded files
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="px-6 py-4 border-b border-border/60">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-500" />
            Latest Uploads
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <RecentUploadsTable
            limit={5}
            showHeader={true}
            autoRefresh={true}
            refreshInterval={30000}
            activeRoute="/dashboard/recent"
          />
        </CardContent>
      </Card>
    </div>
  );
}
