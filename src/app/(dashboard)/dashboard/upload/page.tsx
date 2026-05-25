import UploadZone from "@/components/UploadZone";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { UploadCloud } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Upload Files</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Securely store and manage your documents in the cloud
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-50 dark:bg-violet-950 rounded-lg flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-gray-300" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">File Upload</CardTitle>
              <CardDescription className="text-xs">
                PDF, PNG, JPG, DOCX, XLSX — max 50MB
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UploadZone />
        </CardContent>
      </Card>
    </div>
  );
}
