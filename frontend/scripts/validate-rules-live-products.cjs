const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const portal = fs.readFileSync(path.join(root, 'src', 'components', 'FeaturedMerchPortal.js'), 'utf8');
const dataPath = path.join(root, 'src', 'data', 'rules-products.generated.json');
const publisherPath = path.join(root, '..', 'automation', 'printify', 'publish_rules_collection_v2.py');

const failures = [];

function requireContains(source, needle, label) {
  if (!source.includes(needle)) failures.push(`Missing ${label}: ${needle}`);
}
function requireNotContains(source, needle, label) {
  if (source.includes(needle)) failures.push(`Still contains ${label}: ${needle}`);
}

requireContains(portal, 'rules-products.generated.json', 'generated Printify product data import');
requireNotContains(portal, 'function CampaignPrint', 'cartoon campaign SVG renderer');
requireNotContains(portal, 'className="rules-garment"', 'cartoon garment SVG renderer');
requireContains(portal, 'rules-product-photo', 'real product image rendering');

if (!fs.existsSync(dataPath)) {
  failures.push('Missing generated product data file');
} else {
  let data;
  try { data = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch (err) { failures.push(`Invalid generated product JSON: ${err.message}`); }
  if (data) {
    if (!Array.isArray(data.products) || data.products.length !== 3) failures.push('Generated product data must contain exactly 3 products');
    else {
      const expected = {
        'rules-black-tee': 3200,
        'rules-hoodie': 6200,
        'rules-white-tee': 2800,
      };
      for (const [id, price] of Object.entries(expected)) {
        const product = data.products.find((p) => p.id === id);
        if (!product) { failures.push(`Missing product ${id}`); continue; }
        if (product.price_cents !== price) failures.push(`${id} price must be ${price}`);
        if (!product.image || !/^https:\/\//.test(product.image)) failures.push(`${id} must have a real HTTPS product image`);
        if (!product.url || !/^https:\/\//.test(product.url)) failures.push(`${id} must have a real product URL`);
        if (!product.printify_product_id) failures.push(`${id} must have a Printify product ID`);
      }
    }
  }
}

if (!fs.existsSync(publisherPath)) {
  failures.push('Missing Printify publisher v2 script');
} else {
  const publisher = fs.readFileSync(publisherPath, 'utf8');
  for (const needle of ['3200', '6200', '2800', "'position':'back'", "'position':'front'", 'RULES DON’T EXIST ANYMORE']) {
    requireContains(publisher, needle, `publisher contract token ${needle}`);
  }
}

if (failures.length) {
  console.error('Rules live product contract failed:');
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log('Rules live product contract passed: 3 real Printify products, exact prices, photo-backed site cards, no cartoon garment SVGs.');
