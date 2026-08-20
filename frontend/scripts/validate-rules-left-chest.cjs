const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', '..', 'automation', 'printify', 'apply_rules_approved_layout.py');
const source = fs.readFileSync(target, 'utf8');
const failures = [];

for (const token of [
  'FRONT_X = 0.86',
  'FRONT_Y = 0.21',
  'FRONT_SCALE = 0.22',
  'TEE_BACK_SCALE = 0.88',
  'HOODIE_BACK_Y = 0.56',
  'HOODIE_BACK_SCALE = 0.96',
]) {
  if (!source.includes(token)) failures.push(`Missing approved placement token: ${token}`);
}

if (failures.length) {
  console.error('True left-chest placement contract failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('True left-chest placement contract passed.');
