const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const repoRoot = path.resolve(root, '..');
const registryPath = path.join(root, 'src', 'data', 'iamPrototypeScreens.json');
const pagePath = path.join(root, 'src', 'pages', 'IamPrototype.js');
const appPath = path.join(root, 'src', 'App.js');
const navPath = path.join(root, 'src', 'components', 'Navbar.js');
const seoPath = path.join(root, 'src', 'components', 'SeoManager.js');
const vercelPath = path.join(repoRoot, 'vercel.json');

function fail(message) {
  console.error(`I AM prototype validation failed: ${message}`);
  process.exit(1);
}

function requireText(filePath) {
  if (!fs.existsSync(filePath)) fail(`missing file ${path.relative(repoRoot, filePath)}`);
  return fs.readFileSync(filePath, 'utf8');
}

const registry = JSON.parse(requireText(registryPath));
const pageSource = requireText(pagePath);
const appSource = requireText(appPath);
const navSource = requireText(navPath);
const seoSource = requireText(seoPath);
const vercelSource = requireText(vercelPath);

const requiredAreas = [
  'onboarding',
  'home',
  'talk',
  'plan',
  'career',
  'relationships',
  'wellness',
  'confidence-style',
  'safety',
  'community',
  'memory',
  'profile-subscription',
  'admin-support',
];

if (!registry.meta || registry.meta.status !== 'working title') {
  fail('registry must label the product as a working title');
}

if (!Array.isArray(registry.areas)) fail('registry.areas must be an array');

const areaIds = registry.areas.map((area) => area.id);
for (const required of requiredAreas) {
  if (!areaIds.includes(required)) fail(`missing required area ${required}`);
}

const uniqueAreaIds = new Set();
const uniqueScreenIds = new Set();
const requiredFields = ['id', 'title', 'eyebrow', 'summary', 'primaryAction'];
let screenCount = 0;

for (const area of registry.areas) {
  if (!area.id || !area.label || !area.description) fail('every area needs id, label, and description');
  if (uniqueAreaIds.has(area.id)) fail(`duplicate area id ${area.id}`);
  uniqueAreaIds.add(area.id);
  if (!Array.isArray(area.screens) || area.screens.length === 0) fail(`area ${area.id} has no screens`);

  for (const screen of area.screens) {
    screenCount += 1;
    for (const field of requiredFields) {
      if (typeof screen[field] !== 'string' || !screen[field].trim()) {
        fail(`screen ${screen.id || '(unknown)'} is missing ${field}`);
      }
    }
    if (uniqueScreenIds.has(screen.id)) fail(`duplicate screen id ${screen.id}`);
    uniqueScreenIds.add(screen.id);
  }
}

for (const areaId of ['home', 'talk', 'profile-subscription']) {
  const area = registry.areas.find((item) => item.id === areaId);
  if (!area.screens.some((screen) => screen.safetyPath === true)) {
    fail(`${areaId} must contain a Safety Path shortcut`);
  }
}

const serialized = JSON.stringify(registry).toLowerCase();
for (const forbidden of ['coming soon', 'placeholder', 'tbd']) {
  if (serialized.includes(forbidden)) fail(`registry contains forbidden text: ${forbidden}`);
}

const requiredPageText = [
  'Internal concept review',
  'working title',
  'noindex',
  '/iam/safety',
  '/iam/support',
  '/iam/delete-account',
  'role="dialog"',
  'aria-modal="true"',
  'aria-pressed=',
  'aria-selected=',
  'role="progressbar"',
];
for (const text of requiredPageText) {
  if (!pageSource.includes(text)) fail(`prototype page is missing ${text}`);
}

if (!appSource.includes('path="/iam/internal-prototype"')) {
  fail('App.js is missing the internal prototype route');
}
if (!appSource.includes('import IamPrototype from "./pages/IamPrototype"')) {
  fail('App.js is missing the IamPrototype import');
}
if (navSource.includes('/iam/internal-prototype')) {
  fail('internal prototype must not appear in public navigation');
}

const seoRouteMatches = seoSource.match(/\/iam\/internal-prototype/g) || [];
if (seoRouteMatches.length < 2) {
  fail('SeoManager must define metadata and noindex handling for the internal prototype');
}
if (!seoSource.includes('I AM Internal Prototype | Storm And Me LLC')) {
  fail('SeoManager is missing the internal prototype title');
}
if (!vercelSource.includes('"source": "/iam/internal-prototype"')) {
  fail('vercel.json is missing the internal prototype header rule');
}
if (!vercelSource.includes('"key": "X-Robots-Tag"') || !vercelSource.includes('"value": "noindex, nofollow, noarchive"')) {
  fail('vercel.json must send a noindex X-Robots-Tag for the internal prototype');
}

console.log(
  `I AM prototype validation passed: ${registry.areas.length} areas, ${screenCount} screens, ` +
  `${uniqueAreaIds.size} unique area IDs, ${uniqueScreenIds.size} unique screen IDs, centralized noindex and accessibility checks.`
);
