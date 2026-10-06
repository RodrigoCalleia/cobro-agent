# Pilot-interest validation foundation — 2026-10-06

## Result

Implemented a dependency-free CommonJS request validator at server/validate-pilot-interest.cjs on isolated branch product/pilot-interest-validation-2026-10-06, based on main a812a437c7ea14631cf14422a4196bb955cf68b6. No open PR competed with this task at the initial read.

The validator normalizes a business contact email, accepts an optional literal business name and requires affirmative boolean contact permission. It rejects fields outside the capture allowlist, browser-supplied identifiers/timestamps/notice metadata, nested/non-string fields, control characters, excessive lengths and malformed email syntax. Rejections return field codes without echoing submitted values. This is preparation for a trusted server boundary; a local function by itself is not a deployed server boundary.

## Verification

- Full Node suite: 44 tests passed, zero failed (34 existing plus 10 capture tests).
- Independent task-scoped QA reproduced acceptance of Unicode line/paragraph separators (U+2028/U+2029). The rejection rule and test cases were corrected; the full 44-test suite passed again after the fix.
- Node syntax check passed.
- Static build completed with exactly two demo assets. Existing build tests checked source byte preservation and exclusion of other repository files.
- All fixtures are fictional and use the reserved example.test domain.
- No visual or mobile pass is claimed for this change; deployed index.html and cobro-engine.js remain unchanged.

## Remaining gates

There is no endpoint, visible contact input, new form, stored lead, email notification or saved-success UI. This change does not activate Netlify Forms. Private storage, responsible-party/contact-channel details and approved notice remain unresolved.

Before activation: connect a real server boundary, bind permission to the displayed notice/version, generate private metadata, implement body-size/rate controls and duplicate/retry handling, verify retention/deletion, and independently confirm a tagged synthetic request in private provider storage before deleting it. Separate anonymous-session and mobile checks remain pending.

No purchases, subscriptions, third-party messages, real invoices or customer records were used. No customer-demand, income or spending result is inferred from tests.
