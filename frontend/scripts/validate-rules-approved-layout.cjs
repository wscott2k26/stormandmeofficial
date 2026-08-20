const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const generatorPath = path.join(root, 'automation', 'printify', 'finalize_rules_collection_layout.py');
const applyPath = path.join(root, 'automation', 'printify', 'apply_rules_approved_layout.py');
const failures = [];

if (!fs.existsSync(generatorPath)) failures.push('Missing finalize_rules_collection_layout.py');
if (!fs.existsSync(applyPath)) failures.push('Missing apply_rules_approved_layout.py');

if (fs.existsSync(generatorPath)) {
  const source = fs.readFileSync(generatorPath, 'utf8');
  for (const token of ['tight_back_art', 'crop_transparent', 'official_logo_rgba', 'OBAMA', '2028', "RULES DON'T", 'EXIST ANYMORE']) {
    if (!source.includes(token)) failures.push(`Missing tight-art token: ${token}`);
  }
  if (source.includes('BACK_LOGO')) failures.push('Back artwork must not contain an extra Storm And Me logo');
}

if (fs.existsSync(applyPath)) {
  const source = fs.readFileSync(applyPath, 'utf8');
  const required = [
    'FRONT_X = 0.86',
    'FRONT_Y = 0.21',
    'FRONT_SCALE = 0.22',
    'TEE_BACK_X = 0.50',
    'TEE_BACK_Y = 0.43',
    'TEE_BACK_SCALE = 0.88',
    'HOODIE_BACK_X = 0.50',
    'HOODIE_BACK_Y = 0.56',
    'HOODIE_BACK_SCALE = 0.96',
    'position": "front"',
    'position": "back"',
    'true wearer-left chest mark + large clean back graphic',
  ];
  for (const token of required) {
    if (!source.includes(token)) failures.push(`Missing final placement token: ${token}`);
  }
}

if (failures.length) {
  console.error('Approved Rules streetwear layout contract failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Approved Rules streetwear layout contract passed: true wearer-left chest mark, large clean back graphic, tight transparent art.');
