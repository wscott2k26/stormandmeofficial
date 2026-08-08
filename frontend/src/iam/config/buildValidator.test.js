const path = require("path");
const { spawnSync } = require("child_process");

test("build validator accepts harmless surrounding whitespace in the approved Supabase URL", () => {
  const frontendRoot = path.resolve(__dirname, "../../..");
  const validator = path.join(frontendRoot, "scripts", "validate-iam-app.cjs");
  const result = spawnSync(process.execPath, [validator], {
    cwd: frontendRoot,
    env: {
      ...process.env,
      REACT_APP_SUPABASE_URL: "  https://xdstipqlrnnuutggvhbz.supabase.co  ",
      REACT_APP_SUPABASE_ANON_KEY: "sb_publishable_test_key",
    },
    encoding: "utf8",
  });

  expect(result.status).toBe(0);
});
