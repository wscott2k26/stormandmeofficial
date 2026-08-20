const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', '..', 'automation', 'printify', 'apply_rules_approved_layout.py'), 'utf8');
const failures = [];

// User-approved target: same true-left-chest X/scale, but raised into the classic logo zone.
for (const token of [
  'FRONT_X = 0.86',
  'FRONT_Y = 0.14',
  'FRONT_SCALE = 0.22',
  'TEE_BACK_Y = 0.43',
  'TEE_BACK_SCALE = 0.88',
  'HOODIE_BACK_Y = 0.56',
  'HOODIE_BACK_SCALE = 0.96',
]) {
  if (!source.includes(token)) failures.push(`Missing approved placement token: ${token}`);
}

if (failures.length) {
  console.error('TRUE LEFT-CHEST HEIGHT CONTRACT FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('TRUE LEFT-CHEST HEIGHT CONTRACT PASSED');
