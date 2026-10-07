# Prepared pilot-interest metadata binding

Decision date: 2026-10-07. This document describes unused server-only preparation in open PR #7. It does not approve a privacy notice, expose a contact form, activate storage or prove legal compliance.

## Prepared boundary

`server/prepare-pilot-interest-record.cjs` creates a record preparer from trusted server configuration:

- `noticeVersion` is required when the factory is constructed. It must be a lower-case bounded identifier and is never accepted from browser payload data.
- `generateId` defaults to Node's cryptographic `randomUUID()`. Its result must be a lower-case UUID v4.
- `now` defaults to a new server `Date`. Its result must be a valid Date and is serialized as canonical UTC ISO text.

Each preparation reuses the strict three-field validator. It returns validation field names without submitted values when contact input is invalid. Valid input is normalized and copied before the trusted UUID, timestamp and configured notice version are appended.

Client-supplied `request_id`, `received_at`, `notice_version`, network metadata or any other extra field is rejected before ID/time generation. Invalid trusted generator results or thrown details become a generic `Invalid trusted metadata` error.

The output shape is accepted by the existing guarded storage adapter. A future route may inject the stable server ID prepared from a canonical `Idempotency-Key`, as documented in [RETRY_IDENTITY.md](RETRY_IDENTITY.md). Re-preparation of that same logical retry may create a later `received_at`; the store preserves the first stored timestamp while requiring every other logical field to match. Without the prepared retry identity, calling the preparer again intentionally creates a new record.

## Required future binding

Before activation, a reviewed route must:

1. publish an approved, immutable notice through the deployed page;
2. construct the preparer with exactly that displayed notice version from server code;
3. read and validate the body with the prepared request reader;
4. derive one stable server ID per logical submission, prepare the record and preserve that identity across ambiguous storage retries;
5. confirm the matching private record before showing saved success.

The current module cannot prove that a browser displayed the matching notice. There is no approved notice text, responsible-party identity, withdrawal/deletion contact channel or legal review in the repository. Those decisions must not be invented by code.

## Verification and limits

Fifteen targeted metadata tests still cover normalization, optional fields, client metadata rejection before generators run, notice/dependency configuration, failed/invalid/synchronous-only UUID and clock results, intrinsic Date handling, proxy/revoked clock rejection, payload error encapsulation, input/date snapshots, per-call metadata, compatibility with the guarded store and default generator shapes. Retry identity adds separate tests; the full local suite contains 141 passing tests under Node 24.19.0 and the static build still publishes only the two demo assets.

Independent QA evidence and exact hosted status are recorded in `docs/reports/2026-10-07-trusted-metadata.md`.

This preparation does not provide:

- notice approval or proof of what a user saw;
- email ownership, authentication or qualification;
- route/browser integration of prepared retry identity or unique-business deduplication;
- IP/device metadata, rate limiting or abuse controls;
- retention scheduling, operator authentication or deletion UI;
- hosted handler execution or real provider write/read/delete evidence.

The public function remains unconditional 503 and does not import this module.
