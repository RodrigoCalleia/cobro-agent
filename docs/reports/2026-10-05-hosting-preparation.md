# Hosting preparation — 2026-10-05

## Result

Continued from main `3ca9febe2c2c7f758ac595af33022c910702c9c2`; no open PR or repository AGENTS.md was present. Chose Netlify Free as the initial commercial demo candidate after current official-source verification.

Prepared an isolated branch `build/netlify-demo-2026-10-05` with:
- `netlify.toml`: run all tests, then build, and publish only `dist`.
- Dependency-free `scripts/build-static.cjs`: copy only `index.html` and `cobro-engine.js` without transforming bytes.
- Preflight checks for missing/non-regular source assets, symlinked output and unexpected output entries. Unexpected entries stop the build and are preserved for inspection.
- Seven build tests and a Git ignore rule for generated output.
- Deployment documentation with provider evidence, access blockers and storage acceptance criteria.

Product UI and reminder rules are unchanged. No lead form, success message, external delivery or payment code was added.

## Verification

- `node --test tests/*.test.cjs`: 34 passed, zero failed (27 rules + 7 build).
- `node scripts/build-static.cjs`: passed.
- Netlify TOML parsed with Python's standard TOML parser; build command and publish path matched.
- Actual output contained only the two demo assets; both matched the source byte for byte using `cmp`.
- Independent QA reran all 34 tests, inspected actual output and configuration, and found no blocking defect.
- Browser verification could not run: no Chromium executable or agent-browser CLI was available. No visual or deployed verification is claimed.

## Access and provider evidence

Plugin discovery for Netlify/Cloudflare returned no available connection. No new account, hosting project, subscription or deployment was created; there is no new public demo URL.

Official sources examined on 2026-10-05:
- Commercial Free use: https://www.netlify.com/guides/netlify-vs-vercel/
- Current plan/credit limits: https://www.netlify.com/pricing/
- Build/publish configuration: https://docs.netlify.com/build/configure-builds/file-based-configuration/
- Forms pricing: https://docs.netlify.com/manage/forms/usage-and-billing/ (updated 2026-09-16; free/unlimited on credit-based plans, legacy billing differs)
- Forms activation: https://docs.netlify.com/manage/forms/setup/
- Stored submissions: https://docs.netlify.com/manage/forms/submissions/

Independent infrastructure review confirmed the commercial-use and Forms findings. Forms remains a candidate for leads, not invoice storage. Neither a redirect nor HTTP success alone proves persistence: a test submission must be found in the provider's actual storage before claiming capture is operational.

## Handoff

Review/integrate the prepared configuration, preserving any newer main work. Deployment remains blocked on authenticated and authorized hosting access plus actual plan confirmation. Once deployed, verify the browser flow on mobile/desktop. Before enabling pilot-interest capture, define the offer and privacy/contact purpose and verify POST-to-stored-record behavior. No new customer or conversion evidence was produced.

## Integration closure

[PR #2](https://github.com/RodrigoCalleia/cobro-agent/pull/2) was merged into main at `a9e3ec24b21342f5ca8f46c33f0022bbd3ad5c14` after eight remote files matched the verified local/source contents, main remained unchanged and GitHub reported a clean merge. The report and existing workboard were fetched after merge and preserved. No deployment followed this integration.
