import { buildProfilePayload, isProfileComplete } from "./profileContract";

describe("I AM profile onboarding contract", () => {
  test("builds the exact owner-scoped profile payload", () => {
    expect(buildProfilePayload({
      userId: "user-1",
      displayName: "Will",
      lane: "him",
      acceptedAdultBoundary: true,
      acceptedAiBoundary: true,
      memoryEnabled: false,
      timezone: "America/New_York",
    })).toEqual({
      id: "user-1",
      display_name: "Will",
      lane: "him",
      companion_style: "coach",
      directness: "clear",
      humor: "light",
      faith_mode: "user-led",
      life_areas: [],
      memory_enabled: false,
      declared_adult: true,
      timezone: "America/New_York",
    });
  });

  test("rejects onboarding without both required acknowledgements", () => {
    expect(() => buildProfilePayload({
      userId: "user-1",
      lane: "becoming",
      acceptedAdultBoundary: true,
      acceptedAiBoundary: false,
    })).toThrow("Adult confirmation and AI boundaries must be accepted.");
  });

  test("requires an allowed lane and adult declaration for completion", () => {
    expect(isProfileComplete({ lane: "her", declared_adult: true })).toBe(true);
    expect(isProfileComplete({ lane: "other", declared_adult: true })).toBe(false);
  });
});
