# TODOS

## DSL

### Comment preservation through parse/serialize round-trip

**What:** Attach comments to AST nodes so `serialize()` re-emits them instead of dropping them as whitespace.

**Why:** Form-control edits in the editor reserialize the source, deleting user comments like data-provenance notes. For a plain-text format meant to live in git, that is real data loss.

**Context:** Comments are consumed by the grammar's whitespace rules (`grammar.peggy` `__`/`_`) and never reach the AST. A fix needs comment nodes (or attachment metadata) in `types.ts`, grammar capture, serializer emission, and round-trip tests. The docs spec currently scopes the round-trip guarantee to exclude comments; ROADMAP.md carries the same item.

**Effort:** L
**Priority:** P2
**Depends on:** None

### Deduplicate the duplicate-data error string in grammar.peggy

**What:** Extract a small prelude helper so the `duplicate data block` message and `countDataBlocks` guard live once instead of twice (Chart and Scene actions).

**Why:** The two copies must be edited in lockstep; a future message tweak that touches one site silently desynchronizes the other.

**Context:** `grammar.peggy` Chart (~line 72) and Scene (~line 167) both inline `if (countDataBlocks(members) > 1) { error('duplicate data block — ...') }`. Peggy's `error()` is rule-action-scoped, so the helper must take `error` as a parameter or stay a message constant.

**Effort:** S
**Priority:** P3
**Depends on:** None

### Friendly migration hints for removed keyword spellings

**What:** Optional grammar error alternatives that recognize old spellings (`areafill`, `hide_annotation`, `step`, `_series`) purely to emit a "renamed to X" parse error.

**Why:** Old charts and embeds fail with generic `Expected "="` errors today; a one-line hint would turn every failure into its own migration guide without re-accepting the old syntax.

**Context:** The hard break was deliberate (no legacy parsing). Error-message-only recognition was considered and deferred during the unification ship to keep the grammar free of legacy knowledge. Revisit if old-syntax support requests show up.

**Effort:** S
**Priority:** P3
**Depends on:** None

## Completed

### Update @blueprint-chart/mcp for the kebab-case language break

**What:** Bump the MCP repo's lib dependency and rewrite its suggestion templates (`_series = "Gold","Silver"`, old keyword spellings) to the unified syntax.

**Why:** The MCP server teaches LLMs the DSL. After the breaking rename ships, an MCP server suggesting `_series` against a parser that hard-rejects it breaks the entire AI-authoring loop.

**Context:** The June 2026 language unification renamed `areafill` to `area-fill`, `hide_*`/`show_*` to `hide-*`/`show-*`, `_series` to `series`, and removed the `step` alias, with no legacy parsing. The separate `blueprint-chart/mcp` repo pins the published lib and embeds syntax templates in its `validate_dsl` error remapping. Grep that repo for `_series`, `areafill`, and `hide_` to find every template.

**Effort:** M
**Priority:** P0
**Depends on:** This release being published to npm

**Completed:** v0.1.5 of @blueprint-chart/mcp (2026-06-05) — kebab templates, quotedKey-aware series checks, and lib validateChart wired into validate_dsl.
