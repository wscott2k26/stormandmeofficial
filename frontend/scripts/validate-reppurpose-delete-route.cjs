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
  fail('Repository-root vercel.json is missing; Vercel cannot expose the clean deletion URL.');
} else {
  let config;
  try {
    config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'));
  } catch (error) {
    fail(`Repository-root vercel.json is invalid JSON: ${error.message}`);
  }

  const redirects = Array.isArray(config?.redirects) ? config.redirects : [];
  const rewrites = Array.isArray(config?.rewrites) ? config.rewrites : [];
  const canonicalDestination = '/reppurpose/delete-account.html';

  const hasCleanDeleteRedirect = redirects.some(
    (route) => route?.source === '/delete-account' && route?.destination === canonicalDestination && route?.permanent === true
  );
  const hasSlashDeleteRedirect = redirects.some(
    (route) => route?.source === '/delete-account/' && route?.destination === canonicalDestination && route?.permanent === true
  );
  const hasObsoleteDeleteRewrite = rewrites.some(
    (route) => route?.source === '/delete-account' || route?.source === '/delete-account/'
  );

  if (!hasCleanDeleteRedirect) fail('/delete-account must permanently redirect to the canonical RepPurpose deletion page.');
  if (!hasSlashDeleteRedirect) fail('/delete-account/ must permanently redirect to the canonical RepPurpose deletion page.');
  if (hasObsoleteDeleteRewrite) fail('Deletion aliases must not use CRA-swallowed service rewrites.');
}

if (!process.exitCode) {
  console.log('PASS: RepPurpose clean deletion URLs permanently redirect to the canonical public deletion page.');
}
