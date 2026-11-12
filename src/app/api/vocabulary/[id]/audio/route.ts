import { z } from "zod";
import { getLearner } from "@/features/auth/session";
import { apiError, json } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase } = await getLearner();
    const { id } = await params;
    if (!z.uuid().safeParse(id).success)
      return json({ error: "not_found" }, 404);
    const word = await supabase
      .from("vocabulary")
      .select("audio_asset_id")
      .eq("id", id)
      .maybeSingle();
    if (word.error) return json({ error: "service_unavailable" }, 503);
    if (!word.data?.audio_asset_id) return json({ error: "not_found" }, 404);
    const asset = await supabase
      .from("audio_assets")
      .select("storage_path")
      .eq("id", word.data.audio_asset_id)
      .maybeSingle();
    if (asset.error) return json({ error: "service_unavailable" }, 503);
    if (!asset.data) return json({ error: "not_found" }, 404);
    const signed = await supabase.storage
      .from("hanlearn-audio")
      .createSignedUrl(asset.data.storage_path, 60);
    if (signed.error || !signed.data?.signedUrl)
      return json({ error: "audio_unavailable" }, 404);
    return json({ url: signed.data.signedUrl, expiresIn: 60 });
  } catch (error) {
    return apiError(error);
  }
}
