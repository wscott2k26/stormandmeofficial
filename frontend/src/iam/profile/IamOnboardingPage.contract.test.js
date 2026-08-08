const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "IamOnboardingPage.js"), "utf8");

describe("I AM onboarding route handoff", () => {
  test("refreshes the protected profile after saving before entering the app", () => {
    expect(source).toContain("export default function IamOnboardingPage({ profile, refreshProfile })");

    const saveIndex = source.indexOf("await saveProfile(");
    const refreshIndex = source.indexOf("await refreshProfile()");
    const navigateIndex = source.indexOf('navigate("/iam/app/talk"');

    expect(saveIndex).toBeGreaterThan(-1);
    expect(refreshIndex).toBeGreaterThan(saveIndex);
    expect(navigateIndex).toBeGreaterThan(refreshIndex);
  });
});
