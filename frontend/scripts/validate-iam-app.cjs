const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (relative) => {
  const target = path.join(root, relative);
  if (!fs.existsSync(target)) fail(`missing ${relative}`);
  return fs.readFileSync(target, "utf8");
};
const fail = (message) => {
  console.error(`I AM app validation failed: ${message}`);
  process.exit(1);
};

const packageJson = JSON.parse(read("package.json"));
if (packageJson.dependencies?.["@supabase/supabase-js"] !== "2.106.2") {
  fail("@supabase/supabase-js must be pinned to 2.106.2");
}

const requiredFiles = [
  "src/iam/config/iamConfig.js",
  "src/iam/data/supabaseClient.js",
  "src/iam/auth/authState.js",
  "src/iam/auth/IamAuthProvider.js",
  "src/iam/auth/IamProtectedRoute.js",
  "src/iam/auth/IamEntryPage.js",
  "src/iam/auth/IamAuthPage.js",
  "src/iam/profile/profileContract.js",
  "src/iam/profile/profileApi.js",
  "src/iam/profile/IamOnboardingPage.js",
  "src/iam/layout/IamAppShell.js",
  "src/iam/chat/chatApi.js",
  "src/iam/chat/chatState.js",
  "src/iam/chat/IamTalkPage.js",
  "src/iam/chat/IamConversationsPage.js",
  "src/iam/styles/iam.css",
];
requiredFiles.forEach(read);

const app = read("src/App.js");
for (const marker of [
  'path="/iam"',
  'path="/iam/auth"',
  'path="/iam/onboarding"',
  'path="/iam/app"',
  'path="talk"',
  'path="conversations"',
]) {
  if (!app.includes(marker)) fail(`App.js is missing route marker ${marker}`);
}
const firstLayoutClose = app.indexOf("</Route>");
const realIamEntry = app.indexOf('path="/iam"');
if (firstLayoutClose < 0 || realIamEntry < firstLayoutClose) {
  fail("real I AM application routes must be outside the Storm site Layout route");
}

const navbar = read("src/components/Navbar.js");
for (const privatePath of ["/iam/app", "/iam/auth", "/iam/onboarding"]) {
  if (navbar.includes(privatePath)) fail(`${privatePath} must not appear in public navigation`);
}

const seo = read("src/components/SeoManager.js");
for (const marker of ["/iam/auth", "/iam/onboarding", "/iam/app", "noindex,follow"]) {
  if (!seo.includes(marker)) fail(`SeoManager is missing ${marker}`);
}

const talk = read("src/iam/chat/IamTalkPage.js");
for (const marker of ["8,000", "private", "/iam/safety", 'aria-live="polite"']) {
  if (!talk.includes(marker)) fail(`Talk source is missing ${marker}`);
}
for (const forbidden of ["convert_plan", "Momentum", "streak", "Coming soon", "placeholder"]) {
  if (talk.includes(forbidden)) fail(`Talk source contains deferred Phase 1 control text: ${forbidden}`);
}

const state = read("src/iam/chat/chatState.js");
for (const forbiddenAction of ['action.type === "convert_plan"', 'action.type === "save"', 'action.type === "report"']) {
  if (state.includes(forbiddenAction)) fail(`Phase 1 action filter exposes ${forbiddenAction}`);
}

const provider = read("src/iam/auth/IamAuthProvider.js");
for (const call of ["signUp", "signInWithPassword", "resetPasswordForEmail", "updateUser"]) {
  if (!provider.includes(call)) fail(`authentication provider is missing ${call}`);
}

const onboarding = read("src/iam/profile/IamOnboardingPage.js");
for (const marker of ["at least 18", "not therapy or emergency monitoring", "memoryEnabled", "off by default"]) {
  if (!onboarding.includes(marker)) fail(`onboarding is missing ${marker}`);
}

const config = read("src/iam/config/iamConfig.js");
if (!config.includes("REACT_APP_SUPABASE_URL") || !config.includes("REACT_APP_SUPABASE_ANON_KEY")) {
  fail("browser configuration must use only the approved public Supabase variables");
}

const allIamSource = requiredFiles.map(read).join("\n");
for (const secretMarker of ["SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY", "sk-"]) {
  if (allIamSource.includes(secretMarker)) fail(`browser I AM source contains forbidden secret marker ${secretMarker}`);
}

console.log("I AM app validation passed: auth, onboarding, real chat, history, privacy, noindex, safety-action and dead-control checks.");
