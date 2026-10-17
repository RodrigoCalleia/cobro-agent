'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {normalizeTiendanubeOrders} = require('../server/tiendanube-order-adapter.cjs');

const hashCustomer = value => require('node:crypto').createHash('sha256').update(value).digest('hex').slice(0, 32);
const fixture = () => ({orders: [{
  id: 42, status: 'pending', total: {amount: '1250.50', currency: 'ARS'},
  customer: {id: 7, email: 'must-not-leak@example.test'},
  created_at: '2026-10-17T12:00:00Z', updated_at: '2026-10-17T12:01:00Z'
}], paging: {next_url: 'https://api.tiendanube.com/v1/123/orders?page=2'}});

test('normalizes an order without returning raw customer data', () => {
  const result = normalizeTiendanubeOrders(fixture(), {storeId: 'store-123', hashCustomer});
  assert.equal(result.orders[0].external_order_id, '42');
  assert.equal(result.orders[0].customer_ref.length, 32);
  assert.equal('email' in result.orders[0], false);
  assert.equal(result.next_url.includes('page=2'), true);
});

test('rejects missing customer hash function', () => assert.throws(() => normalizeTiendanubeOrders(fixture(), {storeId: 'x'}), /hashCustomer/));
test('rejects duplicate order identifiers', () => {
  const p = fixture(); p.orders.push({...p.orders[0]});
  assert.throws(() => normalizeTiendanubeOrders(p, {storeId: 'x', hashCustomer}), /Duplicate/);
});
test('rejects malformed IDs and statuses', () => {
  const p = fixture(); p.orders[0].id = 0;
  assert.throws(() => normalizeTiendanubeOrders(p, {storeId: 'x', hashCustomer}), /order id/);
  const q = fixture(); q.orders[0].status = 'PENDING!';
  assert.throws(() => normalizeTiendanubeOrders(q, {storeId: 'x', hashCustomer}), /status/);
});
test('rejects malformed money and currencies', () => {
  const p = fixture(); p.orders[0].total.amount = '1.999';
  assert.throws(() => normalizeTiendanubeOrders(p, {storeId: 'x', hashCustomer}), /amount/);
  const q = fixture(); q.orders[0].total.currency = 'ars';
  assert.throws(() => normalizeTiendanubeOrders(q, {storeId: 'x', hashCustomer}), /currency/);
});
test('rejects invalid dates and pagination outside provider domains', () => {
  const p = fixture(); p.orders[0].created_at = 'not-a-date';
  assert.throws(() => normalizeTiendanubeOrders(p, {storeId: 'x', hashCustomer}), /created_at/);
  const q = fixture(); q.paging.next_url = 'https://evil.example/orders';
  assert.throws(() => normalizeTiendanubeOrders(q, {storeId: 'x', hashCustomer}), /pagination/);
});
test('caps page size before mapping', () => {
  const p = {orders: Array.from({length: 101}, (_, i) => ({id: i + 1, status: 'pending', total: {amount: '1', currency: 'ARS'}, customer: {id: i + 1}}))};
  assert.throws(() => normalizeTiendanubeOrders(p, {storeId: 'x', hashCustomer}), /orders payload/);
});
