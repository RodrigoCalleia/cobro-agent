# Prepared pilot-interest composition

Decision date: 2026-10-07. `server/process-pilot-interest.cjs` is an unused server-only factory in PR #7. The deployed function entry is unchanged and always returns 503; no form, SDK connection, native rate rule or provider record is activated by this composition.

## Trusted configuration and order

`createPilotInterestProcessor({allowedOrigin, noticeVersion, secret, openStore, now})` snapshots the canonical HTTPS origin, bounded notice version, copied HMAC secret, lazy storage callback and trusted clock. Clock defaults to server time. Invalid configuration throws one generic error without its values. Configuration must never come from request body, query or headers.

The future runtime must supply the unmodified platform-native Request and an `openStore` closure using only trusted Netlify Context and `openPublishedInterestStore`. That callback must retain the current published production/site eligibility guards and private storage deadlines. This processor does not authenticate context, authorize a deploy, open an SDK or validate arbitrary JavaScript wrappers.

Invocation order:

1. Check POST and single allowed browser Origin with preflight; reject before reading input.
2. Compare `Pilot-Notice-Version` exactly with trusted configuration; missing, multiple or different versions are rejected before token/body processing.
3. Derive stable server identity from canonical `Idempotency-Key` and runtime HMAC secret.
4. Read bounded JSON and apply the three-field/permission validator.
5. Prepare server metadata per request using the derived identity, configured notice and clock.
6. Open injected private storage lazily and call guarded create/strong-read confirmation.

The notice header declares a client version; it does not prove the browser rendered that text or that the notice was approved. Before activation, the immutable page/notice contract must be independently verified. An old header cannot silently bind permission to a newer notice. Even when a client supplies the current header, reuse of an old token with a changed stored notice conflicts instead of rewriting consent. Do not automatically rewrite a header/token and resubmit after a notice mismatch; the future browser must show the current notice and obtain a fresh affirmative decision.

## Public response contract

Every JSON response uses `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. No contact, business name, retry token, secret, ID, time, notice or raw provider error is echoed.

| Outcome | HTTP | JSON state/code |
| --- | --- | --- |
| Disallowed method | 405, Allow: POST | rejected / method_not_allowed |
| Different or absent Origin | 403 | rejected / origin_not_allowed |
| Unsupported request | 400 | rejected / invalid_request |
| Missing or different notice header | 409 | rejected / notice_mismatch |
| Invalid token | 400 | rejected / invalid_idempotency_key |
| Body byte cap | 413 | rejected / too_large |
| Unsupported media/encoding | 415 | rejected / reader code |
| Body deadline | 408 | rejected / read_timeout |
| Other body/validation rejection | 400 | rejected / fixed reader code |
| Trusted metadata or store opening failure | 503 | unavailable |
| Exact confirmed store result | 200 | stored-confirmed |
| Exact store conflict | 409 | conflict |
| Ambiguous/malformed provider result or dispatched write failure | 202 | received-unverified |

Only an exact confirmed result with matching derived ID and boolean `created` is success. New and duplicate confirmations have the same public response. The injected collaborator is trusted; its claimed result is not proof of a real provider. Actual hosted write/read/delete acceptance remains separate.

## Budgets and aborts

The existing reader retains its two-second budget. Storage initialization plus creation share a fixed five-second monotonic/timer budget per invocation. Expired initialization cannot start a later create. Once create is dispatched, expiration or abort returns unverified, never saved success or rollback confirmation. The processor does not cancel arbitrary collaborator work; the runtime adapter must retain its own transport cancellation. Synchronous blocking code can delay timer dispatch; monotonic checks reject late confirmations. Different invocations retain separate identity, budget and metadata.

Abort checks after parsing/metadata/opening stop further create dispatch. Private persistence may still complete after a dispatched write loses its response; a manual unchanged retry must use the same token and notice. Different tokens are not unique-business deduplication.

## Remaining acceptance

Resolve authenticated hosted 503 verification before integrating PR #7. Then complete responsible party/public withdrawal contact, approved notice/display contract, secrets/versioning, browser lifecycle, native rate enforcement, retention/deletion, operator access and real synthetic provider readback/deletion. No live customer, paid pilot, email or invoice processing is authorized by passing local injected-storage tests.
