const fs = require('fs');
const path = require('path');

// Contract-first regression check for the featured collection.
const portalPath = path.join(__dirname, '..', 'src', 'components', 'FeaturedMerchPortal.js');
const source = fs.readFileSync(portalPath, 'utf8');

const checks = [
  ['collection heading', 'RULES DON’T EXIST ANYMORE'],
  ['Obama 2028 design', 'OBAMA'],
  ['2028 design', '2028'],
  ['official logo asset import', 'ASSETS'],
  ['official logo rendering', 'ASSETS.logo'],
  ['white tee variant', 'rules-white-tee'],
  ['black tee variant', 'rules-black-tee'],
  ['hoodie variant', 'rules-hoodie'],
  ['collection feature marker', 'data-testid="rules-dont-exist-collection"'],
];

const failures = checks.filter(([, needle]) => !source.includes(needle));

if (failures.length) {
  console.error('Rules Don’t Exist collection contract failed:');
  for (const [label, needle] of failures) {
    console.error(`- Missing ${label}: ${needle}`);
  }
  process.exit(1);
}

console.log('Rules Don’t Exist collection contract passed.');
