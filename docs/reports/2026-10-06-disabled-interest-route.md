# SDK integration and disabled interest route — 2026-10-06

## Work completed

Prepared on isolated branch `product/disabled-interest-route-2026-10-06` from main `f8d096dcf884de7cc7876d4215bcac449e500a81`, after reading the current workboard, code, capture/storage contracts and open PR state (none).

- Installed and pinned the official @netlify/blobs 11.1.1 dependency and generated package-lock.json. All 46 resolved dependencies have registry URLs and integrity hashes. SDK requires Node >=22.12; local Node 24.19.0 was used and .nvmrc selects 24.x. No paid service or credential was added.
- Added a lazy server integration that accepts only trusted platform Context for this project's currently published production deploy. Unknown/preview/unpublished/wrong-site contexts fail before SDK import. Existing fixed namespace and strong-read storage adapter is unchanged.
- Added the modern Netlify function entry. It returns HTTP 503/unavailable unconditionally and does not inspect request/context, consume a body, load the SDK, read/write storage, log contacts or schedule work. No environment flag enables it; activation needs a reviewed code change after capture gates. No public form or enrollment claim was added.
- Inspected installed SDK source: conditional setJSON would report modified=true on unexpected non-412 HTTP errors. Added a transport guard accepting only 200/412 PUT responses; other statuses remain unverified instead of false success. Tests cover failures even with an existing matching record.
- Updated verification/deployment/storage documentation for dependency installation and the disabled route. UI/demo source files and netlify.toml are unchanged.

## Evidence

- npm ci --ignore-scripts --no-audit --no-fund succeeded from the lockfile.
- All 77 local Node tests passed, zero failed: 65 existing plus 12 runtime/SDK regression tests.
- Independent QA reran all 77 successfully and reviewed the SDK's actual implementation; no blocking defect for the disabled deployment was found.
- Actual installed SDK is exercised through an in-process transport and reserved synthetic fixtures. Create-only headers, strong read URLs, create/retry/conflict/read/delete and seven unexpected write statuses are checked. No real provider record or live network storage request is involved.
- Disabled handler tests include a request/context proxy that throws on any access and a global network tripwire. A valid synthetic POST remains unconsumed, and responses disclose only unavailable.
- Syntax checks, static build, dependency lock/integrity checks passed. Two static assets match their unchanged sources byte for byte. Dependencies/server code stay outside dist.
- GitHub's Netlify deploy-preview status was successful for product commit `475f69de8b888adc2d4fcc03f2bb1a3ffff7dc9f`: "Deploy Preview ready!". Redirect/Header/Pages checks completed neutral, with no failures. Deploy detail: https://app.netlify.com/projects/cobro-agent-rodrigo/deploys/6ac58e96e0440600085f0cae .
- Direct HTTP GET to the preview function returned 401 with a Login Redirect page. Authentication intercepted the request before the handler; this is not a verified 503 response and is not classified as a function failure. POST and hosted function execution were not verified.
- PR #7 remains open until its hosted unavailable response can be checked with authorized authenticated access. Production was not advanced by this change. Local tests are not a real private write/read/delete acceptance result.

## Limitations and next bounded task

Capture remains disabled. Unresolved prerequisites: notice/responsible-party/public contact, trusted notice association and metadata, bounded body parsing, rate/abuse controls, retry identity/deduplication, authenticated inspection/deletion and verified retention. The SDK may retry five times with 5-second delays; a request deadline/AbortSignal must be added before activation. Namespace separation is not an account-level access boundary.

Next: implement bounded request parsing and trusted metadata/notice association behind the same disabled entry, then complete abuse/retry and privacy gates before synthetic deployed private write/read/delete. Verify actual preview checks before integrating this change. Explicit cached build reproduction remains a separate verification item.

No purchase, subscription activation, third-party message, invoice or revenue transaction occurred. Last recorded experiment totals remain USD 0 spent and USD 0 revenue; no leads, clients or conversion evidence is claimed.

## Primary sources checked

- https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- https://docs.netlify.com/build/functions/api/
- https://docs.netlify.com/build/functions/get-started/
- https://docs.netlify.com/build/configure-builds/manage-dependencies/
- https://github.com/netlify/primitives/issues/741

Package version/engine and return behavior were additionally verified from npm metadata and the installed package, not an obsolete standalone repository release list.

## Persistent result and review status

[PR #7](https://github.com/RodrigoCalleia/cobro-agent/pull/7) contains the SDK/route changes. [Preview](https://deploy-preview-7--cobro-agent-rodrigo.netlify.app) has a successful build status but currently protects direct HTTP access. Closing documentation changes do not change the tested product sources; the successful status above applies to the exact product commit, not a claim that all later documentation commits ran hosted tests.

Next coordinator action: continue this open PR and verify HTTP 503/unavailable without a stored-success claim. Preserve preview protection; do not disable authentication to obtain a pass. Once the handler is verified, inspect latest checks and unchanged-source/main state before integration. Other capture work can proceed in this branch while activation remains disabled, but do not claim capture is operating.
