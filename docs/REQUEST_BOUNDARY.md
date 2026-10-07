# Prepared pilot-interest request boundary

Decision date: 2026-10-07. `server/read-pilot-interest.cjs` is an unused server helper in open PR #7, not an activated HTTP route. The existing public function still returns unconditional 503/unavailable without importing this helper or reading input. No form, contact storage, sender or saved-success claim is enabled.

## Contract

Trusted server code calls `readPilotInterest(request, {timeoutMs})` with a native Fetch Request. Only POST with `application/json` and optional `charset=utf-8` (case-insensitive, optionally quoted) is accepted. Other MIME parameters/types and non-identity content encodings are rejected before body reading. There is no attachment or compressed-body support.

The fixed application body limit is 4096 bytes, counted from actual stream chunks before UTF-8 decoding. Content-Length can reject early but cannot bypass that cap; if supplied it must contain decimal digits, fit the cap and match the final actual byte count. UTF-8 is decoded incrementally with fatal errors, preserving split multibyte characters and rejecting malformed/truncated sequences. A BOM is retained by the decoder and therefore rejected by JSON parsing. JavaScript character counts do not replace the byte limit.

The default two-second read/parse budget belongs to one invocation. Trusted server code may override it with an integer from 1 to 5000 ms; browser input must not configure it. A timer bounds stalled reads and request abort interrupts them. Monotonic checks after each read and before validation/success reject late results even when the event loop delays the timer. Cleanup clears the timer/listener, cancels unfinished reads and releases the stream lock without awaiting a potentially stalled cancellation. Concurrent/later invocations keep separate budgets.

After JSON parsing, the existing strict validator enforces the three-field allowlist, email syntax/length, optional business-name type/length and affirmative boolean permission. Client metadata and extra fields are rejected. Parser failures return `{ok:false, code}`; field validation returns `{ok:false, code:'validation_failed', fields:[field names]}`. Neither includes raw input, stream errors or provider details. Trusted configuration errors throw a generic TypeError. A successful result is `{ok:true, value:...}` containing normalized permitted fields for the trusted caller; it proves neither contact ownership nor persistence, approved notice association or purchase interest.

## Remaining limits

- The cap bounds application consumption/decoded input, not buffers allocated by the platform or an upstream proxy before this code runs. A future HTTP route still requires platform-aware ingress controls and rate/abuse protection.
- This budget starts at the body reader, not the entire HTTP pipeline. Parsing the already bounded JSON is synchronous; event-loop blocking prevents a hard real-time return, while monotonic checks prohibit accepting a late result when execution resumes.
- JSON.parse uses last-value semantics for repeated object keys. This helper does not reject ambiguous repeated JSON keys; do not claim that it does. Review strict duplicate-key handling before binding consent at an activated boundary. Request/unique-business deduplication is also separate and unfinished.
- A future route must generate trusted IDs/timestamps, bind the exact approved notice/version, and apply privacy/responsible-party/public-contact and retention/deletion gates. A boolean input is not proof of an approved consent flow.
- Actual hosted body parsing and private provider write/read/delete acceptance remain unverified. Capture stays disabled and PR #7 remains open until its existing hosted-handler acceptance requirement passes.

## Verification

24 new local tests exercise native Request/Web Streams with synthetic reserved-domain contacts only. They cover exact cap/overflow and understated lengths, multibyte splitting, fatal encoding, malformed JSON/shape/fields, preflight rejections without consumption, consumed/locked streams, stalls, aborts, rejected/stalled cancellation, timer-blocking late input and invocation isolation. Full local suite: 112 tests passed under Node 24.19.0; static build produced the two byte-identical demo assets. No network/provider record is used in these tests. Independent QA evidence and hosted results are recorded in docs/reports/2026-10-07-request-boundary.md.

Primary API references checked 2026-10-07:
- https://nodejs.org/docs/latest-v24.x/api/webstreams.html
- https://nodejs.org/api/util.html#class-utiltextdecoder
