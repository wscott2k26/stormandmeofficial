export const authInitialState = {
  status: "loading",
  session: null,
  user: null,
  error: "",
};

export function authReducer(state, action) {
  switch (action.type) {
    case "SESSION_READY":
      return action.session
        ? { status: "authenticated", session: action.session, user: action.session.user, error: "" }
        : { status: "anonymous", session: null, user: null, error: "" };
    case "SIGNED_OUT":
      return { status: "anonymous", session: null, user: null, error: "" };
    case "AUTH_ERROR":
      return { ...state, status: state.user ? "authenticated" : "error", error: action.error };
    case "CLEAR_ERROR":
      return { ...state, error: "" };
    default:
      return state;
  }
}
