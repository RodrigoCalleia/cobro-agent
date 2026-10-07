# Pilot-interest retry identity

Decision date: 2026-10-07. This document describes unused server-only preparation in open PR #7. Interest capture remains disabled and the public function still returns unconditional 503.

## Prepared protocol

A future browser submission generates one random canonical UUID v4 and sends it in the `Idempotency-Key` header. It must reuse that token only when retrying the same logical submission. The token is not a stored record identifier and is not derived from email, business name or other contact data.

`server/pilot-interest-retry-id.cjs` accepts a stable secret from trusted runtime configuration. It applies HMAC-SHA-256 to a versioned Rondacobro context plus the canonical client token, then converts the first 16 bytes to an opaque UUID v4. The module copies the secret when configured and does not return or log the token, secret or digest.

The same token and secret produce the same server request ID. A different token or secret produces a different identity. Missing or noncanonical normalized header values fail with only `invalid_idempotency_key`; the request body is not consumed. HTTP infrastructure may normalize surrounding header whitespace before this module sees the value. Configuration requires at least 32 actual secret bytes and fails generically.

The storage adapter now treats an existing record with the same derived ID and same logical fields as a retry when the newly prepared `received_at` is equal or later. It preserves and confirms the first stored timestamp. An earlier timestamp, noncanonical provider record, or changed contact address, business name, permission or notice version under the same ID remains a conflict and is never overwritten.

## Required future composition

Before activation, the reviewed route must:

1. receive a canonical random client token and derive the server ID before parsing the body;
2. read and validate the bounded JSON body;
3. prepare trusted metadata using the derived ID and the configured notice version;
4. create once with the guarded store and return saved success only after the matching strong read;
5. keep the runtime secret outside the repository and expose neither token nor request ID as authentication.

The secret must be random, stable and separately provisioned in the authorized runtime. Rotation changes derived IDs and can turn a retry into a second record; activation therefore requires an explicit versioning/migration strategy before any rotation. No secret, environment flag or provider account change is included in this preparation.

## Boundaries

This protocol prevents one client retry token from creating multiple logical records. It does not establish that two different tokens belong to the same business, prove email ownership, rate-limit abuse or stop a client from intentionally creating many tokens. Unique-business measurement must use a separate privacy-reviewed rule and must not use contact data as a public storage key.

The route integration, browser token lifecycle, secret provisioning, rate controls, approved notice/display proof, retention, operator authentication and live provider write/read/delete evidence remain pending. No form, contact, lead or revenue was created.
