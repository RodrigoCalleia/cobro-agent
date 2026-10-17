'use strict';

const MAX_ORDERS = 100;
const idPattern = /^[1-9][0-9]{0,63}$/u;
const statusPattern = /^[a-z][a-z0-9_-]{0,31}$/u;
const currencyPattern = /^[A-Z]{3}$/u;
const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/u;

function invalid(message) { throw new TypeError(message); }
function requiredString(value, pattern, name) {
  if (typeof value !== 'string' || !pattern.test(value)) invalid('Invalid ' + name);
  return value;
}
function optionalIso(value, name) {
  if (value === undefined || value === null) return null;
  requiredString(value, isoPattern, name);
  if (!Number.isFinite(Date.parse(value))) invalid('Invalid ' + name);
  return value;
}
function normalizeMoney(value, name) {
  if (typeof value !== 'string' || !/^\d{1,12}(?:\.\d{1,2})?$/u.test(value)) invalid('Invalid ' + name);
  return value;
}

/**
 * Pure, read-only Tiendanube/Nuvemshop order normalization.
 * It intentionally accepts only the documented fixture shape and never performs
 * network, authorization, messaging or storage operations.
 */
function normalizeTiendanubeOrders(payload, {storeId, hashCustomer} = {}) {
  requiredString(storeId, /^[A-Za-z0-9._:-]{1,128}$/u, 'storeId');
  if (typeof hashCustomer !== 'function') invalid('hashCustomer is required');
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) ||
      !Array.isArray(payload.orders) || payload.orders.length > MAX_ORDERS) {
    invalid('Invalid orders payload');
  }
  const seen = new Set();
  const orders = payload.orders.map((order, index) => {
    if (!order || typeof order !== 'object' || Array.isArray(order)) invalid('Invalid order at index ' + index);
    const externalOrderId = requiredString(String(order.id ?? ''), idPattern, 'order id');
    if (seen.has(externalOrderId)) invalid('Duplicate order id');
    seen.add(externalOrderId);
    const status = requiredString(order.status, statusPattern, 'order status');
    const total = order.total && typeof order.total === 'object' ? order.total : invalid('Invalid order total');
    const amount = normalizeMoney(total.amount, 'order amount');
    const currency = requiredString(total.currency, currencyPattern, 'order currency');
    const customer = order.customer && typeof order.customer === 'object' ? order.customer : invalid('Invalid customer');
    if (typeof customer.id !== 'string' && typeof customer.id !== 'number') invalid('Invalid customer id');
    const customerId = String(customer.id);
    const customerRef = hashCustomer(storeId + ':' + customerId);
    if (typeof customerRef !== 'string' || !/^[a-f0-9]{16,128}$/u.test(customerRef)) invalid('Invalid customer reference');
    return Object.freeze({
      external_order_id: externalOrderId,
      store_id: storeId,
      status,
      amount,
      currency,
      customer_ref: customerRef,
      created_at: optionalIso(order.created_at, 'created_at'),
      updated_at: optionalIso(order.updated_at, 'updated_at')
    });
  });
  const next = payload.paging && payload.paging.next_url;
  if (next !== undefined && next !== null &&
      (typeof next !== 'string' || next.length > 2048 || !/^https:\/\/(?:api\.)?(?:tiendanube|nuvemshop)\.com\//u.test(next))) {
    invalid('Invalid pagination URL');
  }
  return Object.freeze({store_id: storeId, orders: Object.freeze(orders), next_url: next ?? null});
}

module.exports = {normalizeTiendanubeOrders, MAX_ORDERS};
