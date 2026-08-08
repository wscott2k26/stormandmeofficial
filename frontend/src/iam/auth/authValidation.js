export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials(email, password) {
  if (!EMAIL_PATTERN.test(String(email || "").trim())) return "Enter a valid email address.";
  if (String(password || "").length < 10) return "Password must be at least 10 characters.";
  return "";
}

export function validateNewPassword(password, confirmation) {
  if (String(password || "").length < 10) return "Password must be at least 10 characters.";
  if (password !== confirmation) return "The passwords do not match.";
  return "";
}
