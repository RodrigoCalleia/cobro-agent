# Pilot-interest abuse policy

Decision date: 2026-10-07. This is a coordinator-selected policy and acceptance plan for PR #7. It does not install a rule, change an endpoint or activate capture. The existing public handler remains unconditional 503.

## Selected first layer

Prepare one native Netlify function rule for the future single path `/api/pilot-interest`: five requests per 60 seconds, grouped by domain and IP, with blocking rather than rewriting. Five is an initial experiment choice, not measured demand or an industry standard. Shared office networks can share the allowance; adjust only from observed legitimate failures.

This illustrative configuration belongs in the function export in a later reviewed change, not in `netlify.toml`. It is deliberately documentation only:

```js
export const config = {
  path: '/api/pilot-interest',
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: ['ip', 'domain'],
    windowLimit: 5,
    windowSize: 60
  }
};
```

Do not add a POST-only deployment filter until unsupported-method behavior is verified. The eventual route must reject unsupported methods before consuming a body or opening storage. Keep preview/test contexts unable to open production storage.

## Provider facts and their implications

Official Netlify documents checked 2026-10-07 establish:

- Code rules work on Free, which permits two rules per project. This design proposes one; actual deployed rule inventory remains unverified.
- Function rules require `config.path`; over-limit blocking produces 429. Native counts use domain/IP, not the submitted email or token.
- Enforcement can lag the threshold by up to ten seconds. Free cannot provide a domain-wide shared allowance.
- Invalid rules can leave a deploy green. Require the post-processing log to explicitly show the accepted rule.
- A custom function path removes its default `/.netlify/functions/<name>` URL; verify routing on the actual deploy.

Consequently, this is delayed per-client throttling, not a strict five-write quota, global admission control or spending cap. Distributed IPs and separate hostnames can bypass a per-domain/IP allowance. Early code checks and bounded work must remain effective for requests admitted during delay.

## Application behavior before any capture

The future route must apply these coordinator decisions:

1. Require the single configured production origin and reject absent, null or different Origin before body reading; do not derive this allowlist from a browser Host/forwarded header. This intentionally supports only our future same-origin browser flow. It reduces cross-site browser submissions but is not authentication or bot prevention because non-browser clients can forge Origin.
2. Reject unsupported methods, compressed/non-JSON bodies, invalid retry keys and disallowed origins before SDK/store opening. Preserve the prepared 4096-byte reader and its two-second budget; only after field/notice validation prepare the record and open the guarded store.
3. Use platform-provided identity for any future application limiter, never client-supplied `X-Forwarded-For`, `Forwarded`, query parameters or contact fields. Do not store IP addresses, user-agent strings or raw submissions in application records/logs as part of this policy.
4. Do not use a process-local Map as a global limiter or a Blobs read-then-write counter as an atomic quota. No new limiter service, CAPTCHA account or subscription is selected.
5. Treat 429 by HTTP status before parsing a body: it may not contain application JSON. Show a wait/error state, preserve the same logical submission token and do not report saved success or automatically retry. Use a valid bounded Retry-After only when actually supplied; otherwise wait at least 60 seconds before a deliberate retry. Timeout/503 also remain unverified and never trigger an unbounded loop.
6. Treat repeated tokens as retries, not new leads. Different tokens from one business still require a separate private qualification/deduplication decision. Neither an IP nor Origin proves business identity, email ownership or permission.

These application behaviors are not implemented by this document. The existing reader caps application consumption; it does not impose a 4096-byte upstream ingress limit. The prepared storage deadline is also not a complete HTTP pipeline deadline.

## Acceptance matrix — pending

Keep the handler disabled during initial hosted rule/routing tests. The coordinator executes these with authorized hosting access; no work is delegated to the owner.

| Check | Required evidence before activation |
| --- | --- |
| Rule installation | Exact-commit post-processing log lists path, action, domain/IP grouping and 5/60 values; green status alone fails this gate. |
| Route coverage | Configured path works as expected; default function URL, trailing slash, redirects and deploy-specific hostnames cannot expose an unprotected capture path. If an alias reaches the future handler, remove it or prove equal protection. |
| Bounded throttling probe | Against the disabled handler only: at most 30 requests at no more than one/second, stop at first 429. Account for the ten-second delay. Absence of 429 is a failed/unverified check, not permission to raise traffic. Verify eventual recovery with a separate low-volume request after the window settles. |
| Identity spoofing | Changing forwarded headers, retry token or payload does not reset the native allowance from the same connection. A second real network has an independent allowance; never infer this from forged headers. |
| Isolation | Test/preview requests, obsolete deploy-specific URLs and unsupported method/origin inputs cannot open production storage. Existing preview protection stays in place. |
| Browser handling | Plain/non-JSON 429, absent/malformed Retry-After, 503 and timeout never show saved success or start automatic retry loops. Manual retries preserve the token for unchanged input. |
| Boundary and provider | Existing size/deadline/field checks still reject before storage; valid synthetic storage receipt, independent read and verified deletion satisfy PILOT.md separately. |

All checks above are pending. Login redirects, authentication 401/403 or provider protection pages cannot count as rate/handler evidence; the authorized test session must demonstrably reach the intended path. No traffic probe, post-processing inspection, active rule or provider record is claimed in this policy cycle.

## Availability and budget guard

No paid upgrade or automatic top-up is authorized. Before activation, re-confirm the actual Free-plan limit/credit state using authorized account access and record only non-private results. Native per-IP throttling does not protect the project's whole usage budget. If legitimate access is repeatedly blocked or traffic/credits show an unexplained spike, restore the previously verified disabled handler before attempting further capture. The coordinator must verify a project-scoped rollback path in advance; no team-wide or other-project change is authorized. Old immutable deploy URLs may remain reachable after rollback: verify that every unpublished/obsolete deploy cannot open production storage, rather than assuming that moving the published pointer disables it. Rollback is containment, not instantaneous global admission control. A hard cross-client quota remains unresolved.

Prepared 2026-10-07 in open PR #7: the unused [browser-origin/method preflight](PREFLIGHT.md) checks POST and one trusted canonical HTTPS Origin before body consumption. Synthetic composition with the bounded reader passes. The public handler is unchanged and this helper is not active; native rate enforcement, browser/route wiring and hosted acceptance remain pending. Retain all privacy, notice, secret, retention and provider gates.

## Sources

Primary documentation checked 2026-10-07:

- https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/ — plan availability, rule export/path, 429, enforcement timing and post-processing validation (page updated 2026-09-17).
- https://docs.netlify.com/build/functions/configuration/ — custom/default routing and platform payload boundaries (page updated 2026-09-17).
- https://docs.netlify.com/build/functions/api/ — Config shape and platform Context IP (page updated 2026-07-30).
