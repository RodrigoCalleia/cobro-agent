# Operator runtime transport hardening — 2026-10-10

## Result

Hardened the disconnected operator runtime so the audit store always receives `verifiedOperatorAuditFetch`. Conditional audit writes now accept only explicit HTTP 200 success or HTTP 412 conflict before the pinned Netlify Blobs SDK can normalize the response. Rights-store reads and writes keep their existing guarded transport and exact readback protections.

This closes a concrete SDK boundary: an unexpected PUT 201 or provider 4xx/5xx cannot reach audit readback as a claimed successful write. A new test also confirms that a stalled authorization consumes the same shared budget and never starts an audit claim.

## Verification

- Runtime-focused tests: **6/6 passed**.
- Complete repository suite: **291/291 passed**.
- Static build passed with exactly two demo assets.
- Import inspection found no operator runtime in the public function, browser client or demo page.
- Independent review confirmed the wrapper placement is the minimum correct change and found no privacy leak in command, audit or public results.

## Boundary and next

No route, scheduler, real identity, provider record, customer data, outreach, payment or subscription was added. A timed-out remote write can remain uncertain and must still be resolved through the existing lease/replay contract. Further non-blocking coverage should exercise the pinned SDK's conditional headers, EU/strong configuration and stalled audit/repair/terminal stages.

Capture and real repairs remain disabled. Recorded spend **USD 0**; recorded revenue **USD 0**; verified leads/customers **0**.
