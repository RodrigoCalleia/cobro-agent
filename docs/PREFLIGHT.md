# Same-origin request preflight preparation

Decision date: 2026-10-07. This is unused preparation in open PR #7; the public function still returns unconditional 503. No form, contact record or rate rule is enabled.

`server/pilot-interest-preflight.cjs` exports `createPilotInterestPreflight({allowedOrigin})`. Trusted server configuration supplies one canonical HTTPS origin, without a path, trailing slash, credentials, query or fragment. Configuration is snapshotted; invalid configuration throws a generic error without its values.

The returned synchronous function checks a native Request's actual method first, allowing only POST. It then compares the normalized Origin header exactly with the configured origin. Missing, null, multiple, preview or different origins fail. Native Headers trims surrounding HTTP whitespace before comparison. Host, Forwarded, X-Forwarded-* and method-override headers cannot grant permission. Native intrinsic access prevents overridden method/headers/get properties from replacing these checks; unsupported or proxied request objects fail generically. Native brand checking can invoke a Proxy prototype trap; this is not a zero-side-effect sandbox for arbitrary JavaScript objects.

Results are `{ok: true}` or `{ok: false, code}` with `method_not_allowed`, `origin_not_allowed` or `invalid_request`. The helper does not read the body, parse fields, generate record metadata, import storage, log request data or perform network calls. Response status/header mapping belongs to the future route. Browser/network validation remains pending; local Request tests do not establish deployed behavior.

## Future composition and limits

The future route must use the unmodified platform-supplied native Request, retain trusted current-production/storage gates, then check method/origin before deriving retry identity, reading bounded JSON, binding the approved notice and metadata, or writing privately. Rejected preflight must stop before those operations. Allowed preflight still requires every subsequent validation and deployment gate. Preflight does not sanitize arbitrary JavaScript wrappers for the downstream reader. The helper's result is not a save confirmation.

Origin is a browser signal, not authentication, address ownership or abuse prevention: non-browser clients can forge it. Same-origin malicious clients remain possible. This policy intentionally rejects clients without Origin. There is no dynamic request-derived origin allowlist and no preview-domain fallback. See [abuse controls](ABUSE_CONTROLS.md) for the separate future native rate rule and hosted acceptance matrix.

Do not activate capture until responsible-party/contact facts, approved notice/display binding, private access, retention/deletion, retry secret provisioning, browser composition, rate controls and real provider write/read/delete verification pass. The authenticated hosted 503 check is still required before integrating PR #7. Preserve the existing access protection.
