# Data Flow

Hermes Browser Extension connects browser context to the Hermes Agent runtime you configure. This document describes the shipped v0.1.5 data flow.

## Connection modes

### Local Hermes API

Default Gateway URL:

```text
http://127.0.0.1:8642
```

In local mode, context is sent from the extension to the Hermes Gateway/API server running on the same machine.

### Remote Hermes API

When you configure a remote `https://` Gateway URL and API key/browser token, context is sent to that remote Hermes API server. Use a trusted network path such as Tailscale/VPN/reverse proxy + HTTPS. Do not expose a Hermes API server naked to the public internet.

### Remote dashboard WebSocket

When remote mode has a dashboard URL and no API key, the extension uses the signed-in dashboard tab to mint a single-use WebSocket ticket and connects to the dashboard socket. In this mode, REST-only features such as profile list and image upload can be unavailable.

## What can be sent to Hermes

Depending on settings and page availability, a turn can include:

- user message typed into the composer
- active tab title and URL
- selected text
- readable page text
- page metadata, headings, form labels, links, buttons, and interactive element labels where available
- open tab titles/URLs when “Include open tabs” is enabled
- YouTube transcript text when a transcript provider is enabled and available
- attached text files or metadata for non-text files
- pasted/attached images as inline data, or as a local path when the connected Hermes runtime advertises image upload support
- voice transcript text from Hermes STT or Browser speech fallback
- selected model/session/profile/settings metadata needed to route the request

## What Hermes saw receipt

v0.1.5 adds a collapsible “What Hermes saw” receipt after each sent turn. It summarizes:

- active tab
- whether selected text was included
- page text character count
- whether a YouTube transcript was included
- open tab count
- attachment counts
- redaction count

This receipt is for transparency and debugging. It is generated locally by the extension from the outgoing context.

## Redaction and untrusted context

Before page text is sent to Hermes, the extension redacts common secret/token shapes such as bearer tokens, provider API keys, private keys, GitHub tokens, Slack tokens, JWTs, and common `key=value` secret assignments.

Browser page content is wrapped as untrusted context in the prompt. Hermes is instructed not to follow instructions from the page unless the human user explicitly asks.

## Capability detection

The extension reads `/v1/capabilities` when available. If an older Hermes runtime does not expose that endpoint, v0.1.5 enters legacy compatibility mode:

- core chat/session features are attempted when the Gateway is connected and authenticated
- browser-specific routes such as audio transcription, browser pairing, profile list, and image upload stay in fallback/manual mode unless advertised

## Related docs

- [PERMISSIONS.md](PERMISSIONS.md)
- [PRIVACY.md](PRIVACY.md)
- [SECURITY.md](SECURITY.md)
