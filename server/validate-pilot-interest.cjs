'use strict';

// Preparation only: not an HTTP endpoint or a storage confirmation.
const allowed = new Set(['contact_email', 'business_name', 'contact_permission']);
const controls = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u;

function basicEmail(value) {
  const parts = value.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (!/^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+$/u.test(local)) return false;
  const labels = domain.split('.');
  return labels.length >= 2 && labels.every(label => label.length <= 63 && /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/u.test(label));
}

function validatePilotInterest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(input))) {
    return {ok: false, errors: ['payload']};
  }
  // Intended for a parsed JSON body; never coerce nested objects into strings.
  const keys = Reflect.ownKeys(input);
  if (keys.some(key => !allowed.has(key))) return {ok: false, errors: ['unexpected_fields']};
  const errors = [];
  const email = typeof input.contact_email === 'string' ? input.contact_email.trim() : '';
  if (!Object.hasOwn(input, 'contact_email') || typeof input.contact_email !== 'string' || controls.test(input.contact_email) ||
      email.length > 254 || !basicEmail(email)) errors.push('contact_email');
  const hasBusiness = Object.hasOwn(input, 'business_name');
  const business = hasBusiness && typeof input.business_name === 'string' ? input.business_name.trim() : '';
  if (hasBusiness && (typeof input.business_name !== 'string' || controls.test(input.business_name) ||
      input.business_name.length > 100)) errors.push('business_name');
  if (!Object.hasOwn(input, 'contact_permission') || input.contact_permission !== true) errors.push('contact_permission');
  if (errors.length) return {ok: false, errors};
  return {ok: true, value: {
    contact_email: email,
    ...(hasBusiness ? {business_name: business} : {}),
    contact_permission: true
  }};
}

module.exports = {validatePilotInterest};
