const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');
const frontendRoot = path.join(repoRoot, 'frontend');
const canonicalPage = path.join(frontendRoot, 'public', 'reppurpose', 'delete-account.html');
const vercelConfig = path.join(frontendRoot, 'vercel.json');

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

if (!fs.existsSync(vercelConfig)) {
  fail('frontend/vercel.json is missing; /delete-account cannot be pinned to the canonical deletion page.');
} else {
  let config;
  try {
    config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'));
  } catch (error) {
    fail(`frontend/vercel.json is invalid JSON: ${error.message}`);
  }

  const rewrites = Array.isArray(config?.rewrites) ? config.rewrites : [];
  const hasCleanDeleteRoute = rewrites.some(
    (route) => route?.source === '/delete-account' && route?.destination === '/reppurpose/delete-account.html'
  );
  const hasSlashDeleteRoute = rewrites.some(
    (route) => route?.source === '/delete-account/' && route?.destination === '/reppurpose/delete-account.html'
  );

  if (!hasCleanDeleteRoute) fail('/delete-account rewrite is missing or points somewhere else.');
  if (!hasSlashDeleteRoute) fail('/delete-account/ rewrite is missing or points somewhere else.');
}

if (!process.exitCode) {
  console.log('PASS: RepPurpose public account-deletion route contract is pinned.');
}
