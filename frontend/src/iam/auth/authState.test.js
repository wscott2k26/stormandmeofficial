import { authInitialState, authReducer } from "./authState";

describe("I AM auth state", () => {
  test("moves from loading to authenticated", () => {
    const session = { user: { id: "user-1", email: "adult@example.com" } };
    expect(authReducer(authInitialState, { type: "SESSION_READY", session })).toEqual({
      status: "authenticated",
      session,
      user: session.user,
      error: "",
    });
  });

  test("clears identity on sign out", () => {
    expect(authReducer(
      { status: "authenticated", session: {}, user: {}, error: "" },
      { type: "SIGNED_OUT" }
    )).toEqual({ status: "anonymous", session: null, user: null, error: "" });
  });

  test("keeps a plain user-facing auth error", () => {
    expect(authReducer(authInitialState, {
      type: "AUTH_ERROR",
      error: "Invalid login credentials",
    }).error).toBe("Invalid login credentials");
  });
});
