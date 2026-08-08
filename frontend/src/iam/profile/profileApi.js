import { requireSupabase } from "../data/supabaseClient";
import { buildProfilePayload } from "./profileContract";

export async function loadProfile(userId, client = requireSupabase()) {
  if (!userId) throw new Error("User id is required.");
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message || "Your profile could not be loaded.");
  return data;
}

export async function saveProfile(userId, input, client = requireSupabase()) {
  const payload = buildProfilePayload({ ...input, userId });
  const { data, error } = await client
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw new Error(error.message || "Your choices were not saved.");
  return data;
}
