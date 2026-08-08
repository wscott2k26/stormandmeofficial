import fs from "fs";
import path from "path";

describe("I AM route contract", () => {
  test("registers the real app outside the Storm site layout", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "src/App.js"), "utf8");
    expect(source).toContain('path="/iam"');
    expect(source).toContain('path="/iam/auth"');
    expect(source).toContain('path="/iam/onboarding"');
    expect(source).toContain('path="/iam/app"');
    expect(source.indexOf('path="/iam"')).toBeGreaterThan(source.indexOf("</Route>"));
  });
});
