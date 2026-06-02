# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Report privately through one of these channels:

1. **GitHub private vulnerability reporting** (preferred) — on the [repository Security tab](https://github.com/blueprint-chart/blueprint-chart/security/advisories/new), click **Report a vulnerability**.
2. **Email** — `security@blueprintchart.com`.

Please include:

- a description of the issue and its impact,
- steps to reproduce (a minimal `.bpc` source or HTML page is ideal),
- affected package(s) and version(s),
- any suggested remediation.

## What to expect

- **Acknowledgement** within 5 business days.
- An initial assessment and severity rating shortly after.
- Coordinated disclosure: we'll agree on a timeline with you and credit you in the advisory unless you prefer to remain anonymous.

## Scope

Blueprint Chart is **static-first**: charts are authored and rendered entirely in the browser, and by default data never leaves the client. There is no chart-hosting backend to attack. The areas most relevant to security are therefore:

- **The `.bpc` parser and renderer** (`@blueprint-chart/lib`) — parsing untrusted input, and any path that could lead to XSS or script injection in rendered output or embeds.
- **The embeddable runtime** (`<script type="application/blueprint-chart">` / IIFE bundle) — how third-party data and configuration are handled on a host page.
- **The editor** (`@blueprint-chart/editor`) — handling of user-supplied data and DSL.

Out of scope: vulnerabilities in third-party dependencies that already have a public advisory and a fix (please upgrade), and issues requiring a compromised local machine or browser.

## Supported versions

Blueprint Chart is pre-1.0 and ships frequently. Security fixes land on the latest release line; please upgrade to the most recent version before reporting.

| Version | Supported |
| --- | --- |
| Latest `0.1.x` | ✅ |
| Older releases | ❌ |
