const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('cockpit follow-up plan export remains local and human-approved', () => {
  assert.match(index, /id="exportPlan"/);
  assert.match(index, /rondacobro-plan-seguimiento\\.json/);
  assert.match(index, /requiresHumanApproval:true/);
  assert.doesNotMatch(index, /\\bfetch\\s*\\(/);
  assert.doesNotMatch(index, /XMLHttpRequest/);
});
