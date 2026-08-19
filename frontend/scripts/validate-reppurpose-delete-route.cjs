const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');
const frontendRoot = path.join(repoRoot, 'frontend');
const canonicalPage = path.join(frontendRoot, 'public', 'reppurpose', 'delete-account.html');
const vercelConfig = path.join(repoRoot, 'vercel.json');
const shadowFrontendConfig = path.join(frontendRoot, 'vercel.json');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(canonicalPage)) {
  fail('RepPurpose canonical deletion page is missing.');
} else {
  const html = fs.readFileSync(canonicalPage, 'utf8');
  for (const required of [
    'Delete your RepPurpose account.',
    'request-account-deletion',
    'Your RepPurpose authentication account.',
    'Your saved fitness profile and preferences.',
    'Your user-owned workout history.',
    'Your user-owned meal entries.',
  ]) {
    if (!html.includes(required)) fail(`Canonical deletion page is missing: ${required}`);
  }
}

if (fs.existsSync(shadowFrontendConfig)) {
  fail('frontend/vercel.json must not shadow the repository-root Vercel project configuration.');
}

if (!fs.existsSync(vercelConfig)) {
  fail('Repository-root vercel.json is missing; Vercel will not apply the clean deletion rewrite.');
} else {
  let config;
  try {
    config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'));
  } catch (error) {
    fail(`Repository-root vercel.json is invalid JSON: ${error.message}`);
  }

  const rewrites = Array.isArray(config?.rewrites) ? config.rewrites : [];
  const isCanonicalFrontendDestination = (destination) =>
    destination &&
    typeof destination === 'object' &&
    destination.service === 'frontend' &&
    destination.path === '/reppurpose/delete-account.html';

  const hasCleanDeleteRoute = rewrites.some(
    (route) => route?.source === '/delete-account' && isCanonicalFrontendDestination(route?.destination)
  );
  const hasSlashDeleteRoute = rewrites.some(
    (route) => route?.source === '/delete-account/' && isCanonicalFrontendDestination(route?.destination)
  );

  if (!hasCleanDeleteRoute) fail('/delete-account must route to the canonical file inside the frontend service.');
  if (!hasSlashDeleteRoute) fail('/delete-account/ must route to the canonical file inside the frontend service.');
}

if (!process.exitCode) {
  console.log('PASS: RepPurpose public account-deletion route is pinned in the effective multi-service Vercel config.');
}
