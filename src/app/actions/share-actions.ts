// app/actions/share-actions.ts
"use server";

import { createClient } from "@supabase/supabase-js";

// Use service role client for server actions (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Use service role key from env
);

export async function createShareLink(data: {
  document_id: string;
  user_id: string;
  share_token: string;
  password_hash: string | null;
  expires_at: string | null;
  max_downloads: number | null;
}) {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("shared_links")
      .insert({
        document_id: data.document_id,
        user_id: data.user_id,
        share_token: data.share_token,
        password_hash: data.password_hash,
        expires_at: data.expires_at,
        max_downloads: data.max_downloads,
        download_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating share link:", error);
    return { success: false, error: "Failed to create share link" };
  }
}
