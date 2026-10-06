# Cached static-build exception — 2026-10-06

## Deliverable

Implemented on isolated branch `fix/netlify-cached-config-2026-10-06` from main `54b647bfdf3bec9fca8c2858ff4d2d0e52068663`. This addresses the observed extra config artifact described in the previous storage-preparation report.

The builder permits an existing `dist/netlify.toml` only when both the output entry and repository source config are regular files and their bytes match exactly. It preserves the copy without rewriting or deleting it. A clean build still creates only index.html and cobro-engine.js. Every other unexpected entry, changed config, missing source config, directory or symlink fails before either demo asset is replaced. The configuration's presence does not prove where it originated.

## Verification

- All 65 local Node tests passed, zero failed (56 existing plus nine regression tests).
- Regression coverage includes repeated exact-copy rebuilds with preserved bytes, inode and mtime; differing line endings; missing/source-directory/source-symlink config; output-directory/output-symlink/dangling-symlink config; and an unrelated extra entry.
- Negative config cases verify that both existing demo assets remain unchanged.
- Clean static build succeeded with two assets. Product UI, rules, storage adapter and demo source files are unchanged.
- Independent QA reran all 65 tests successfully and reviewed the bounded exception; no blocking defect was found.
- Before merge, GitHub reported Netlify deploy-preview success ("Deploy Preview ready!") for tested PR head `8f1ccfa9bbb813f1b8725093ed824943bf003c6a`. Preview: https://deploy-preview-6--cobro-agent-rodrigo.netlify.app . Netlify detail ID: `6ac571697e7cd40008e93b64`. Redirect/Header/Pages checks completed with neutral conclusions, with no failing checks.
- PR #6 was merged at `b68bd7ce44b0adcc39353881cc0c3389a92e063e` after fresh unchanged-main, matching-head and mergeability checks. The merged tree equals the tested branch tree. Demo source blobs are unchanged.
- This browser session displays Log in and no usable deploy log. No hosted test count, cache restore evidence, additional cached retry or production-deploy confirmation is claimed. GitHub's successful preview status is provider evidence, but does not establish that the observed extra config copy was restored during this build.

## Boundaries and next action

No new dependency, SDK, endpoint, form, private provider record, real invoice, email delivery or billing was activated. Capture still needs its privacy/responsible-party/public-contact gates, trusted route integration and synthetic private write/read/delete verification.

No purchase, paid subscription or revenue transaction occurred in this cycle. Last recorded experiment totals remain USD 0 spent and USD 0 revenue; no customer or conversion metric is asserted.

Before integration inspect the actual GitHub/Netlify preview checks. A successful clean build alone does not prove a successful cached provider rebuild. Preserve concurrent main changes with a checked branch head.

## Integration and handoff

- [PR #6](https://github.com/RodrigoCalleia/cobro-agent/pull/6)
- [Merge commit](https://github.com/RodrigoCalleia/cobro-agent/commit/b68bd7ce44b0adcc39353881cc0c3389a92e063e)
- [Provider preview](https://deploy-preview-6--cobro-agent-rodrigo.netlify.app)
- [Deploy details](https://app.netlify.com/projects/cobro-agent-rodrigo/deploys/6ac571697e7cd40008e93b64)

The code change is integrated and locally regression-tested. Provider preview success was checked before integration. Explicit cached rebuild verification remains pending authenticated deploy access; keep this narrow exception and reject any divergent artifact rather than silently deleting it. Production status was pending/no statuses at the first post-merge read; the earlier verified public demo remains the last confirmed production deployment at that point.

Next bounded implementation: pin the official storage SDK and add a disabled trusted server route. Keep public contact collection disabled until notice/responsible-party/contact, body/rate controls and synthetic write/read/delete gates are met. No external prospect contact is authorized by this report.
