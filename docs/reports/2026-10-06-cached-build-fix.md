# Cached static-build exception — 2026-10-06

## Deliverable

Prepared on isolated branch `fix/netlify-cached-config-2026-10-06` from main `54b647bfdf3bec9fca8c2858ff4d2d0e52068663`. This addresses the observed extra config artifact described in the previous storage-preparation report.

The builder permits an existing `dist/netlify.toml` only when both the output entry and repository source config are regular files and their bytes match exactly. It preserves the copy without rewriting or deleting it. A clean build still creates only index.html and cobro-engine.js. Every other unexpected entry, changed config, missing source config, directory or symlink fails before either demo asset is replaced. The configuration's presence does not prove where it originated.

## Verification

- All 65 local Node tests passed, zero failed (56 existing plus nine regression tests).
- Regression coverage includes repeated exact-copy rebuilds with preserved bytes, inode and mtime; differing line endings; missing/source-directory/source-symlink config; output-directory/output-symlink/dangling-symlink config; and an unrelated extra entry.
- Negative config cases verify that both existing demo assets remain unchanged.
- Clean static build succeeded with two assets. Product UI, rules, storage adapter and demo source files are unchanged.
- Independent QA reran all 65 tests successfully and reviewed the bounded exception; no blocking defect was found. Hosted preview inspection will be recorded in the closing update. No hosted result or cached provider pass is claimed here.

## Boundaries and next action

No new dependency, SDK, endpoint, form, private provider record, real invoice, email delivery or billing was activated. Capture still needs its privacy/responsible-party/public-contact gates, trusted route integration and synthetic private write/read/delete verification.

No purchase, paid subscription or revenue transaction occurred in this cycle. Last recorded experiment totals remain USD 0 spent and USD 0 revenue; no customer or conversion metric is asserted.

Before integration inspect the actual GitHub/Netlify preview checks. A successful clean build alone does not prove a successful cached provider rebuild. Preserve concurrent main changes with a checked branch head.
