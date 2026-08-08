const path = require("path");
const { spawnSync } = require("child_process");

const frontendRoot = path.resolve(__dirname, "../../..");
const validator = path.join(frontendRoot, "scripts", "validate-iam-app.cjs");

function runValidator(url) {
  return spawnSync(process.execPath, [validator], {
    cwd: frontendRoot,
    env: {
      ...process.env,
      REACT_APP_SUPABASE_URL: url,
      REACT_APP_SUPABASE_ANON_KEY: "sb_publishable_test_key",
    },
    encoding: "utf8",
  });
}

test("build validator accepts harmless surrounding whitespace in the approved Supabase URL", () => {
  expect(runValidator("  https://xdstipqlrnnuutggvhbz.supabase.co  ").status).toBe(0);
});

test("build validator accepts a copied Supabase URL with a trailing slash", () => {
  expect(runValidator("https://xdstipqlrnnuutggvhbz.supabase.co/").status).toBe(0);
});
