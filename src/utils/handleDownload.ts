import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}
export const handleDownload = async (doc: Document) => {
  debugger;
  const { data } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.storage_path, 60);

  if (data?.signedUrl) {
    try {
      // Pehle file ko fetch karo blob ki tarah
      const response = await fetch(data.signedUrl);
      const blob = await response.blob();

      // Blob URL banao
      const blobUrl = window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = doc.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Download started!", {
        description: `${doc.file_name} is being downloaded.`,
      });
    } catch {
      toast.error("Download failed!", {
        description: "Could not download the file.",
      });
    }
  } else {
    toast.error("Download failed!", {
      description: "Could not generate download link.",
    });
  }
};
