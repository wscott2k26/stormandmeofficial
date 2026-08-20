const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const portalPath = path.join(root, 'src', 'components', 'FeaturedMerchPortal.js');
const dataPath = path.join(root, 'src', 'data', 'rules-products.generated.json');
const source = fs.readFileSync(portalPath, 'utf8');

const checks = [
  ['collection heading', 'RULES DON’T EXIST ANYMORE'],
  ['official logo asset import', 'ASSETS'],
  ['official logo rendering', 'ASSETS.logo'],
  ['collection feature marker', 'data-testid="rules-dont-exist-collection"'],
];

const failures = checks.filter(([, needle]) => !source.includes(needle));

if (!fs.existsSync(dataPath)) {
  failures.push(['generated product data', 'rules-products.generated.json']);
} else {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const ids = new Set((data.products || []).map((product) => product.id));
    for (const id of ['rules-white-tee', 'rules-black-tee', 'rules-hoodie']) {
      if (!ids.has(id)) failures.push([`${id} variant`, id]);
    }
    const copy = JSON.stringify(data);
    if (!copy.includes('Obama 2028')) failures.push(['Obama 2028 design', 'Obama 2028']);
  } catch (error) {
    failures.push(['valid generated product data', error.message]);
  }
}

if (failures.length) {
  console.error('Rules Don’t Exist collection contract failed:');
  for (const [label, needle] of failures) {
    console.error(`- Missing ${label}: ${needle}`);
  }
  process.exit(1);
}

console.log('Rules Don’t Exist collection contract passed.');
