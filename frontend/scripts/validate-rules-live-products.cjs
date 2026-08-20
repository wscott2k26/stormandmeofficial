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
requireContains(portal, 'item.image', 'live product image binding');
requireContains(portal, 'item.url', 'live product URL binding');

if (!fs.existsSync(dataPath)) {
  failures.push('Missing generated product data file');
} else {
  let data;
  try { data = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch (err) { failures.push(`Invalid generated product JSON: ${err.message}`); }
  if (data) {
    if (String(data.shop_id) !== '28312107') failures.push(`Expected official Printify storefront shop_id 28312107, got ${data.shop_id}`);
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
        if (!product.image || !/^https:\/\/images-api\.printify\.com\/mockup\//.test(product.image)) failures.push(`${id} must use a real Printify mockup image`);
        if (!product.image.includes('camera_label=back')) failures.push(`${id} must use a real back-view mockup`);
        if (!product.url || !/^https:\/\/storm-and-me-official\.printify\.me\/product\//.test(product.url)) failures.push(`${id} must have a direct official storefront product URL`);
        if (!product.printify_product_id) failures.push(`${id} must have a Printify product ID`);
        if (product.visible !== true) failures.push(`${id} must be visible in the storefront`);
      }
    }
  }
}

if (!fs.existsSync(publisherPath)) {
  failures.push('Missing Printify publisher v2 script');
} else {
  const publisher = fs.readFileSync(publisherPath, 'utf8');
  for (const needle of [
    '3200',
    '6200',
    '2800',
    '"position": "back"',
    '"position": "front"',
    '"x": 0.5',
    '"y": 0.38',
    '"scale": 3.0',
    'RULES DON’T EXIST ANYMORE',
    'OFFICIAL_SHOP_ID',
    '28312107',
  ]) {
    requireContains(publisher, needle, `publisher contract token ${needle}`);
  }
}

if (failures.length) {
  console.error('Rules live product contract failed:');
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log('Rules live product contract passed: 3 real Printify products, exact prices, real back-view site mockups, direct storefront links, and a visible centered 3x Storm And Me front treatment for Printify store cards.');
