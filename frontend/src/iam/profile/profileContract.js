export const IAM_LANES = Object.freeze(["him", "her", "becoming"]);

export function isProfileComplete(profile) {
  return Boolean(
    profile &&
    IAM_LANES.includes(profile.lane) &&
    profile.declared_adult === true
  );
}

export function buildProfilePayload(input) {
  const userId = String(input?.userId || "").trim();
  const lane = String(input?.lane || "").trim();
  if (!userId) throw new Error("User id is required.");
  if (!IAM_LANES.includes(lane)) throw new Error("Choose Him, Her, or Becoming.");
  if (!input.acceptedAdultBoundary || !input.acceptedAiBoundary) {
    throw new Error("Adult confirmation and AI boundaries must be accepted.");
  }

  return {
    id: userId,
    display_name: String(input.displayName || "").trim() || null,
    lane,
    companion_style: "coach",
    directness: "clear",
    humor: "light",
    faith_mode: "user-led",
    life_areas: [],
    memory_enabled: input.memoryEnabled === true,
    declared_adult: true,
    timezone: String(input.timezone || "").trim() || null,
  };
}
