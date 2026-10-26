import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCoverDimensions,
  getScrollFrameIndex,
  getActiveOverlayStage,
  filterCatalogProducts,
  toggleChecklistItemInNotes,
  validateQuoteForm,
  buildWhatsAppFollowUpUrl,
  type ProductItem,
} from './b2bLogic';

const sampleProducts: ProductItem[] = [
  {
    id: 1,
    title: 'Mustard De-Oiled Cake (Pressed Flakes)',
    category: 'De-Oiled Cakes',
    image: './product-1.jpg',
    form: 'Pressed Cake Flakes',
    targetBuyers: 'Cattle Feed Manufacturers & Bulk Traders',
    description: 'Nutrient-dense pressed oil cake flakes derived from mustard seed extraction.',
  },
  {
    id: 8,
    title: 'Pure Yellow Mustard Seeds (Milling Grade)',
    category: 'Yellow Mustard',
    image: './product-8.jpg',
    form: 'Cleaned Whole Seeds',
    targetBuyers: 'Edible Oil Mills, FMCG & Bulk Buyers',
    description: 'High-purity yellow mustard seeds sourced from trusted agricultural belts.',
  },
];

test('computeCoverDimensions computes accurate object-fit: cover geometry', () => {
  const res = computeCoverDimensions(1440, 900, 1920, 1080);
  // scale = max(1440/1920 = 0.75, 900/1080 = 0.8333333) = 0.8333333
  assert.equal(Math.round(res.drawWidth), 1600);
  assert.equal(Math.round(res.drawHeight), 900);
  assert.equal(Math.round(res.offsetX), -80);
  assert.equal(Math.round(res.offsetY), 0);
});

test('getScrollFrameIndex maps progress [0..1] to 120 frames accurately', () => {
  assert.equal(getScrollFrameIndex(0, 120), 0);
  assert.equal(getScrollFrameIndex(0.5, 120), 59);
  assert.equal(getScrollFrameIndex(1, 120), 119);
  assert.equal(getScrollFrameIndex(-0.2, 120), 0);
  assert.equal(getScrollFrameIndex(1.5, 120), 119);
});

test('getActiveOverlayStage transitions at 35% and 70% thresholds', () => {
  assert.equal(getActiveOverlayStage(0), 1);
  assert.equal(getActiveOverlayStage(0.20), 1);
  assert.equal(getActiveOverlayStage(0.35), 2);
  assert.equal(getActiveOverlayStage(0.69), 2);
  assert.equal(getActiveOverlayStage(0.70), 3);
  assert.equal(getActiveOverlayStage(1.0), 3);
});

test('filterCatalogProducts returns all items on All and filters by exact category', () => {
  assert.equal(filterCatalogProducts(sampleProducts, 'All').length, 2);
  const yellowMustard = filterCatalogProducts(sampleProducts, 'Yellow Mustard');
  assert.equal(yellowMustard.length, 1);
  assert.equal(yellowMustard[0].id, 8);
});

test('toggleChecklistItemInNotes adds and removes checklist tags cleanly', () => {
  let notes = 'Bulk tanker dispatch needed.';
  notes = toggleChecklistItemInNotes(notes, 'Private-Label Packaging', true);
  assert.ok(notes.includes('[Checklist: Private-Label Packaging]'));
  notes = toggleChecklistItemInNotes(notes, 'Private-Label Packaging', false);
  assert.ok(!notes.includes('[Checklist: Private-Label Packaging]'));
  assert.equal(notes, 'Bulk tanker dispatch needed.');
});

test('validateQuoteForm enforces required B2B fields and accepts valid input', () => {
  const invalid = validateQuoteForm({
    companyName: '',
    contactName: 'A',
    email: 'invalid-email',
    phone: '123',
    productCategory: '',
    notes: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.companyName);
  assert.ok(invalid.errors.contactName);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.productCategory);

  const valid = validateQuoteForm({
    companyName: 'AgriCorp Foods Pvt Ltd',
    contactName: 'Rajesh Sharma',
    email: 'procurement@agricorp.in',
    phone: '+91 98765 43210',
    productCategory: 'Yellow Mustard Oil (Bulk)',
    notes: 'Recurring monthly supply for FMCG bottling line.',
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('buildWhatsAppFollowUpUrl generates valid wa.me link for +919057292529', () => {
  const url = buildWhatsAppFollowUpUrl({
    companyName: 'Sunrise Edible Oils',
    contactName: 'Vikram Mehta',
    email: 'vikram@sunriseoils.com',
    phone: '+919057292529',
    productCategory: 'Yellow Mustard',
    notes: 'Bulk tanker inquiry',
  });
  assert.ok(url.startsWith('https://wa.me/919057292529?text='));
  assert.ok(decodeURIComponent(url).includes('Sunrise Edible Oils'));
});
