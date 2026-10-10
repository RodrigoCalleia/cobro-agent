# Pinned SDK audit acceptance — 2026-10-10

## Result

Exercised the disconnected operator-audit adapter through the installed `@netlify/blobs` 11.1.1 SDK and found a real integration defect: the adapter required an exact two-method plain object, while the pinned SDK exposes those methods on its store prototype. The production runtime would therefore have rejected the real SDK before any audit claim.

The adapter now discovers only data-method descriptors on the store or its prototype chain, binds them to the SDK instance and rejects accessor-backed methods without invoking them. The SDK-backed synthetic acceptance confirms strong reads use the uncached endpoint, every request uses `eu-central-1`, the initial claim carries `If-None-Match: *`, and terminal completion carries the prior ETag in `If-Match`. Exact readback and the existing 200/412 transport restriction remain in force.

A separate runtime regression confirms that a stalled audit claim consumes the shared deadline and cannot start request or contact-index repair storage.

## Verification

- Operator audit/runtime focused tests: **22/22 passed**.
- Complete repository suite: **294/294 passed**.
- Static build passed with exactly two demo assets.
- Independent pre-implementation audit identified the installed-SDK and per-stage timeout evidence as the correct next gap. Coordinator execution then exposed and corrected the SDK store-shape defect.
- Netlify preview for the preceding hardening commit `e31b05a` is green; this commit requires its own preview check.

## Boundary and next

All SDK traffic was synthetic and in-process; no real provider record, credential, identity, customer data or repair was used. No route, scheduler or capture path imports this operator runtime. Capture and real repairs remain disabled.

Next coverage should isolate stalled repair and stalled terminal persistence, including late resolution and replay behavior. Recorded spend **USD 0**; recorded revenue **USD 0**; verified leads/customers **0**.
