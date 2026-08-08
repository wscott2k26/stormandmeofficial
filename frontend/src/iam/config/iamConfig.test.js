import { readIamConfig } from "./iamConfig";

describe("I AM public configuration", () => {
  test("accepts the expected Supabase public values", () => {
    expect(readIamConfig({
      REACT_APP_SUPABASE_URL: "https://xdstipqlrnnuutggvhbz.supabase.co",
      REACT_APP_SUPABASE_ANON_KEY: "public-anon-value",
    })).toEqual({
      isConfigured: true,
      supabaseUrl: "https://xdstipqlrnnuutggvhbz.supabase.co",
      supabaseAnonKey: "public-anon-value",
      errors: [],
    });
  });

  test("normalizes a copied Supabase URL with a trailing slash", () => {
    expect(readIamConfig({
      REACT_APP_SUPABASE_URL: "https://xdstipqlrnnuutggvhbz.supabase.co/",
      REACT_APP_SUPABASE_ANON_KEY: "public-anon-value",
    })).toEqual({
      isConfigured: true,
      supabaseUrl: "https://xdstipqlrnnuutggvhbz.supabase.co",
      supabaseAnonKey: "public-anon-value",
      errors: [],
    });
  });

  test("fails closed when either public value is missing", () => {
    const result = readIamConfig({ REACT_APP_SUPABASE_URL: "" });
    expect(result.isConfigured).toBe(false);
    expect(result.errors).toEqual([
      "REACT_APP_SUPABASE_URL must be an https://*.supabase.co URL.",
      "REACT_APP_SUPABASE_ANON_KEY is required.",
    ]);
  });
});
