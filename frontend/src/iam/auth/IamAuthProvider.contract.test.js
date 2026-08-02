import fs from "fs";
import path from "path";
import { validateNewPassword } from "./IamAuthPage";

function source(file) {
  return fs.readFileSync(path.join(process.cwd(), "src/iam/auth", file), "utf8");
}

describe("I AM authentication contract", () => {
  test("contains complete sign-up, sign-in, reset request and password update calls", () => {
    const provider = source("IamAuthProvider.js");
    expect(provider).toContain("client.auth.signUp");
    expect(provider).toContain("emailRedirectTo: `${window.location.origin}/iam/auth?mode=confirmed`");
    expect(provider).toContain("client.auth.signInWithPassword");
    expect(provider).toContain("client.auth.resetPasswordForEmail");
    expect(provider).toContain("client.auth.updateUser({ password: normalized })");
  });

  test("rejects short and mismatched reset passwords", () => {
    expect(validateNewPassword("short", "short")).toBe("Password must be at least 10 characters.");
    expect(validateNewPassword("a-long-password", "another-password")).toBe("The passwords do not match.");
    expect(validateNewPassword("a-long-password", "a-long-password")).toBe("");
  });
});
