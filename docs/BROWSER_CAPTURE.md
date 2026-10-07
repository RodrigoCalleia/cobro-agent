# Prepared browser capture lifecycle

Decision date: 2026-10-07. This is an unused controller prepared in PR #7, not an active form. The public demo still uses fictional data. Its two published assets and the unconditional 503 function remain unchanged.

## Integration boundary

`client/pilot-interest-controller.js` is dependency-free and browser-compatible, with a CommonJS export for local tests. It has no default network transport, storage, analytics, contact inputs or automatic retry loop. A future trusted page integration must supply an approved, visibly rendered notice, collect an affirmative decision, and inject a same-origin transport matching `docs/CAPTURE_PROCESSOR.md`.

Transport accepts a frozen request envelope containing POST method, JSON body, fixed headers and an AbortSignal. It resolves a parsed response envelope. This is an injected collaborator contract, not a native fetch adapter or proof of provider persistence. The eventual adapter must reject unexpected redirects/cross-origin responses, bound response reading, retain the HTTP status and pass only the exact parsed public schema. Passing a fabricated success object to the controller is not storage evidence.

Public state must contain only fixed state/code and decision/action indicators. Contact fields and retry tokens stay in volatile private controller memory and the explicit transport request. No localStorage/sessionStorage is used. Page reload, reset or a new controller loses retry continuity; this is not cross-session or unique-business deduplication.

## API

`createPilotInterestController({noticeVersion, transport, generateToken?, timeoutMs?})` provides `getState`, `setDraft`, `submit`, `cancel`, `replaceNotice`, `reset` and `dispose`. Default token generation uses `crypto.randomUUID`; an injected token generator is trusted and must use cryptographically secure randomness. Canonical UUID syntax cannot prove randomness. No insecure fallback is supplied.

`setDraft` takes an explicit snapshot with string `contact_email`, string `business_name` (empty is allowed) and boolean `contact_permission`; it does not infer permission from a previous DOM checkbox. Same-notice edits supply their own explicit decision for the new snapshot. The UI must bind this to the displayed approved notice and actual user action. Local shape/length checks are not server validation or email ownership verification.

`submit` is also the manual retry action. Concurrent submits do not dispatch a second request; confirmed state cannot submit again without starting a new draft/reset. `getState` returns a frozen object containing only `state`, `code`, `noticeRequiresDecision` and `canSubmit`. `dispose` drops controller-owned draft/token references and invalidates completions, but cannot erase copies already held by a transport or guarantee memory erasure.

Each attempt has a default 10-second budget (trusted configuration: 1–15,000ms), a timer and monotonic final check. Timers do not provide a hard wall-clock deadline during browser suspension or synchronous blocking. Cancellation requests transport abort; the collaborator may ignore it. Edits/reset/disposal invalidate old completions before they can replace the current state.

## Retry and consent

An unchanged manual retry uses the same canonical UUID v4 and exact serialized payload/notice snapshot. A changed payload starts a new identity. Different identifiers do not prove different businesses. A timeout or cancellation after dispatch cannot prove rollback; the provider may already have stored the record. Never automatically retry or create a new token merely because the response is missing.

Notice mismatch blocks further submission. Explicit notice replacement must clear permission; the page must display the approved notice and request a fresh affirmative decision before sending. Neither a version string nor a checked boolean proves which text was actually displayed. Approval/rendering and trusted notice configuration remain independent activation gates.

## Confirmation and remaining acceptance

Only HTTP 200 with the exact `stored-confirmed` schema may produce confirmed state. HTTP 202 remains `received-unverified`; malformed, unexpected or ambiguous responses cannot produce a saved-success claim. Strict status/schema matching does not replace actual server/provider strong-read confirmation.

Local fake-transport tests do not verify DOM controls, accessible messaging, native fetch, browser deadlines under suspension, cross-tab behavior or real Netlify storage. Before exposure: approved identity/contact/privacy notice, authenticated hosted-handler acceptance, secret provisioning, native rate controls, private retention/deletion/operator access, synthetic provider write/read/delete, and mobile/desktop end-to-end verification. No email, invoice operation, enrollment, payment or automatic marketing is enabled.
