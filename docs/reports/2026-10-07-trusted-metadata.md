# Trusted metadata preparation — 2026-10-07

## Source and decision

Re-read main workboard at `4195794861d07d59ce7ad3c879bb663520033bac`, open PR #7 at `b7f282e01b27bf119936b2eea58dcdbd385bffb3`, the latest request-boundary report and the current reader, validator, storage adapter, tests and capture contract. Continued the existing isolated branch; no competing product PR or other repository was changed.

Authenticated hosted-handler execution remains blocked by the recorded Netlify team-protection login. It was not re-probed without new access evidence. The highest-value independent prerequisite was trusted record metadata generation behind the unchanged disabled route.

## Delivered

Added `server/prepare-pilot-interest-record.cjs`, an unused server-only factory requiring a bounded trusted notice version. It revalidates the three permitted contact fields, rejects client metadata and generates a lower-case UUID v4 plus canonical UTC received-at timestamp from trusted synchronous dependencies. Output matches the guarded storage adapter's record contract.

The preparer does not approve notice text or prove what a browser displayed. Preparing again creates a new request ID; logical retries across separate HTTP submissions and unique-business deduplication remain unfinished. The public function remains unconditional 503 and does not import the preparer, request reader or storage path.

Added `docs/METADATA_BINDING.md` and updated the pilot, request-boundary and storage guides to separate completed metadata generation from pending notice approval/display binding, rate controls, privacy/contact, retention/deletion and provider acceptance.

## Verification and independent QA

Fifteen targeted tests and the full 129-test suite passed under Node 24.19.0. Static build passed and still produced only the two expected demo assets. Tests use reserved synthetic contacts and in-process storage only; no network, live provider record or customer data was used.

The task-scoped independent reviewer found three concrete classes of defects in injected dependency handling: overwritten Date methods could forge the timestamp, rejected Promise dependencies could leak unhandled rejection details, and Proxy/revoked clock checks could expose trap errors. All were fixed before commit by using intrinsic Date operations inside the protected boundary, draining rejected thenables and adding generic payload/metadata error encapsulation. It independently reran all 129 tests and 25 additional adversarial cases covering cross-realm/forged/frozen/revoked dates, UUID variants, getters, rejected thenables and mutation; no blocker remains for the disabled-preparation scope.

## Accounting, blockers and next step

No spending, subscription, third-party message, real invoice, contact, customer, demand or payment was created. Verified experiment totals remain USD 0 expenses and USD 0 revenue.

PR #7 must remain open until authorized hosted 503 execution is verified. Before capture activation, Rondacobro still needs approved notice content, responsible-party and withdrawal/deletion contact details, proof that the deployed page displayed the configured notice version, cross-submission retry identity/deduplication, rate/abuse controls, retention/deletion, authenticated operator access and synthetic provider write/read/delete confirmation.

Next bounded work: design and test a server-only logical retry identity boundary without exposing an active route, or prepare the immutable notice/render contract once the responsible-party and public contact facts are available. Do not invent those facts.

PR: https://github.com/RodrigoCalleia/cobro-agent/pull/7

Hosted status for the exact product commit is recorded after the isolated branch update; a green build does not prove handler execution, rendered-notice association or provider persistence.
