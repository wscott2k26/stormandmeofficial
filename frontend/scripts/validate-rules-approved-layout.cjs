const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const scriptPath = path.join(root, 'automation', 'printify', 'finalize_rules_collection_layout.py');
const failures = [];

if (!fs.existsSync(scriptPath)) {
  failures.push('Missing finalize_rules_collection_layout.py');
} else {
  const source = fs.readFileSync(scriptPath, 'utf8');
  const required = [
    'FRONT_X = 0.30',
    'FRONT_Y = 0.28',
    'BACK_X = 0.50',
    'RULES DON’T EXIST ANYMORE',
    'tight_back_art',
    'official_logo_rgba',
    'OBAMA',
    '2028',
    "RULES DON'T",
    'EXIST ANYMORE',
    'position": "front"',
    'position": "back"',
  ];
  for (const token of required) {
    if (!source.includes(token)) failures.push(`Missing approved-layout token: ${token}`);
  }
  if (source.includes('BACK_LOGO')) failures.push('Back must not contain an extra Storm And Me logo');
  if (!source.includes('crop_transparent')) failures.push('Back artwork must be tightly cropped to avoid a giant square print area');
}

if (failures.length) {
  console.error('Approved Rules streetwear layout contract failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Approved Rules streetwear layout contract passed.');
