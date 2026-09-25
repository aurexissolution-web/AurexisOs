import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parsePrice,
  organizationJsonLd,
  serviceJsonLd,
  breadcrumbJsonLd,
  SITE_URL,
} from '../src/lib/seo.ts';

test('parsePrice reads ringgit amounts and ignores non-prices', () => {
  assert.deepEqual(parsePrice('From RM1,525'), { amount: 1525, from: true, monthly: false });
  assert.deepEqual(parsePrice('RM785/mo'), { amount: 785, from: false, monthly: true });
  assert.deepEqual(parsePrice('From RM2,025/mo'), { amount: 2025, from: true, monthly: true });
  assert.equal(parsePrice('Custom quote'), null);
  assert.equal(parsePrice('Quoted'), null);
  assert.equal(parsePrice('+45–100% of setup'), null);
});

test('organization graph names the brand, founders and location', () => {
  const g = organizationJsonLd()['@graph'];
  const org = g.find((n) => n['@type'].includes('Organization'));
  assert.equal(org.name, 'Aurexis Solution');
  assert.equal(org['@id'], `${SITE_URL}/#organization`);
  assert.ok(org.logo.url.endsWith('/icon.png'));
  assert.equal(org.address.addressLocality, 'Kuala Lumpur');
  assert.equal(org.address.addressCountry, 'MY');
  assert.deepEqual(org.founder.map((f) => f.name), ['Sanjay Gunabalan', 'Nemila Raj Selvaraj']);
  assert.ok(org.sameAs.some((u) => u.includes('linkedin.com/company/aurexissolution')));
  for (const host of ['instagram.com', 'facebook.com', 'tiktok.com']) {
    assert.ok(org.sameAs.some((u) => u.includes(host)), host);
  }
  assert.equal(org.legalName, 'Aurexis Solution');
  assert.equal(org.identifier.value, '202503293847 (NS0315281-P)');
  assert.ok(org.knowsAbout.length >= 5);
  assert.ok(g.some((n) => n['@type'] === 'WebSite'));
});

test('service schema carries real tier prices in MYR', () => {
  const s = serviceJsonLd({
    slug: 'flow',
    name: 'Flow',
    description: 'Admin automation.',
    tiers: [
      { name: 'Flow Lite', price: 'From RM2,250' },
      { name: 'Flow Enterprise', price: 'Quoted' },
    ],
  });
  assert.equal(s['@type'], 'Service');
  assert.equal(s.url, `${SITE_URL}/solutions/flow`);
  assert.equal(s.provider['@id'], `${SITE_URL}/#organization`);
  assert.equal(s.areaServed.name, 'Malaysia');
  const offers = s.hasOfferCatalog.itemListElement;
  assert.equal(offers.length, 2);
  assert.equal(offers[0].priceSpecification.minPrice, 2250);
  assert.equal(offers[0].priceCurrency, 'MYR');
  assert.equal(offers[1].priceSpecification, undefined, 'quoted tiers state no price');
});

test('breadcrumbs are positioned from 1 with absolute URLs', () => {
  const b = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Solutions', path: '/solutions' },
  ]);
  assert.equal(b.itemListElement[0].position, 1);
  assert.equal(b.itemListElement[1].item, `${SITE_URL}/solutions`);
});
