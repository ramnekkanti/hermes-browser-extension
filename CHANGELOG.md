# Changelog

## v0.1.5 — 2026-06-27

- Added a Hermes compatibility panel backed by `/v1/capabilities`, with legacy fallback when older gateways do not advertise feature support.
- Made first-run Connect avoid missing pairing routes: unsupported runtimes now go straight to Manual setup with Gateway URL/token guidance.
- Added capability-gated voice dictation: Hermes STT is used when advertised, otherwise the side panel and visible voice page use Browser speech fallback when available.
- Added token hygiene UI with masked token state, connection mode, last-tested timestamp, and one-click token clearing.
- Added a collapsible “What Hermes saw” receipt after each sent turn so users can inspect tab/context/attachment/redaction payloads.
- Gated image upload and profile APIs behind capabilities so missing routes become clear fallback warnings instead of broken UX.
- Added public permissions, data-flow, and privacy docs for the current shipped extension behavior.

## v0.1.4 — 2026-06-26

- Added editable Hermes session titles, including first-message auto-naming for new Browser sessions.
- Reworked connection state so the side panel uses live gateway reachability instead of treating a saved API key as connected.
- Added commit-aware update checks for unpacked builds, including same-version "unpulled commits" guidance.
- Expanded agent discovery to trusted remote hosts while keeping bearer tokens off non-Hermes probe targets.
- Refined the default Nous palette toward the ink-blue/soft-white Desktop look.

## v0.1.1 — 2026-06-24

- Added drag/drop attachments directly into the composer, including PDFs and files.
- Added Stop and Queue Message controls while Hermes is responding.
- Added `/` and `@` skill command autocomplete backed by Hermes skills.
- Added Agent Profile settings section with graceful fallback for gateways without profile APIs.
- Replaced the large Refresh button with a compact refresh icon.
- Improved streaming completion handling so final answers replace partial deltas.

## v0.1.0-alpha — 2026-06-24

- First public alpha preparation for Hermes Browser Extension.
- Chrome/Edge MV3 side panel.
- Local Hermes Gateway/API connection.
- Active page context capture.
- Streaming response support with fallback.
- Read-only browser context model.
- Load-unpacked install path; not yet on the Chrome Web Store.
