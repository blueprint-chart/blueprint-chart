## [1.5.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.4.0...v1.5.0) (2026-07-12)

## [1.4.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.3.0...v1.4.0) (2026-07-11)

## [1.3.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.2.0...v1.3.0) (2026-07-07)

## [1.2.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.1.0...v1.2.0) (2026-07-06)

## [1.1.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.0.0...v1.1.0) (2026-07-02)

## [1.0.0](https://github.com/blueprint-chart/blueprint-chart/compare/v0.4.0...v1.0.0) (2026-06-24)

### ⚠ BREAKING CHANGES

* **annotation:** repeat = N means N additional scenes (own + next N)
* **editor:** emit annotation repeat, drop id and visibility verbs from DSL output
* **editor:** remove annotation visibility plumbing from scene model
* **editor:** drop annotation visibility verbs from DSL grammar
* **dsl:** remove annotation id property, validate repeat
* **dsl:** remove annotation visibility verbs and AnnotationVisibility node

### Features

* **annotation:** repeat = N means N additional scenes (own + next N) ([13d0e2e](https://github.com/blueprint-chart/blueprint-chart/commit/13d0e2e2e910fde7b34d62cee414a224c546b173))
* **annotations:** key transitions on internal annotation key ([1ece27d](https://github.com/blueprint-chart/blueprint-chart/commit/1ece27d44462e43f5e82ebf42ab78a2cb68c1ed1))
* **dsl:** parse annotation repeat into AnnotationConfig ([6d79007](https://github.com/blueprint-chart/blueprint-chart/commit/6d79007076a6eae07d396aad54dd5ec57b652027))
* **dsl:** remove annotation id property, validate repeat ([3c5b57e](https://github.com/blueprint-chart/blueprint-chart/commit/3c5b57e8870c066f4e9d0ad86b083e98137fe487))
* **dsl:** remove annotation visibility verbs and AnnotationVisibility node ([0c99a52](https://github.com/blueprint-chart/blueprint-chart/commit/0c99a52a2d7385712863e2670e8a1255c626cda5))
* **editor:** add annotation Repeat control, drop visibility toggle and id ([af329d8](https://github.com/blueprint-chart/blueprint-chart/commit/af329d8a01b901ed8b22a3613b9f835d66c4001b))
* **editor:** add repeat-windowing helper resolveVisibleAnnotations ([c8b5d11](https://github.com/blueprint-chart/blueprint-chart/commit/c8b5d110a82795de7ba560c6d95e987632de2b60))
* **editor:** drop annotation visibility verbs from DSL grammar ([79c2e91](https://github.com/blueprint-chart/blueprint-chart/commit/79c2e91ffbdcc1875cc1a60d67cee57ca5678ec1))
* **editor:** emit annotation repeat, drop id and visibility verbs from DSL output ([36710b1](https://github.com/blueprint-chart/blueprint-chart/commit/36710b1e096b74cb3d4f17e9c78d5d5fcd408499))
* **editor:** origin-grouped annotation editing with key-based selection ([de03d11](https://github.com/blueprint-chart/blueprint-chart/commit/de03d11820e403be25d77ec592f8ac8b582082e3))
* **editor:** remove annotation visibility plumbing from scene model ([a0cf9e8](https://github.com/blueprint-chart/blueprint-chart/commit/a0cf9e808a5b4922f506f29f7e6275436aa90e19))
* **editor:** window preview annotations by repeat ([31961f9](https://github.com/blueprint-chart/blueprint-chart/commit/31961f94b656b175700e799c07490a3ff5ba69df))
* **render:** preserve caller-supplied annotation key in resolveScene ([ec7f258](https://github.com/blueprint-chart/blueprint-chart/commit/ec7f258d6f74d94108b6a0082124610b25393c9c))
* **render:** resolve annotation visibility by repeat window ([b59e4c9](https://github.com/blueprint-chart/blueprint-chart/commit/b59e4c9439aa8839564b26b795bcbde3c6e20dd4))

### Bug Fixes

* **annotation:** anchor top-level annotations at the base/first frame ([4240c03](https://github.com/blueprint-chart/blueprint-chart/commit/4240c0337cb1fe0c7f064a57e731a37137697471))
* **editor:** drag annotations by key, not index, in two-group tab ([0a46a5b](https://github.com/blueprint-chart/blueprint-chart/commit/0a46a5b3502cb30bb45ee6af8ff41da229581072))
* **editor:** label the no-repeat annotation option "Never" not "Once" ([b6afd8e](https://github.com/blueprint-chart/blueprint-chart/commit/b6afd8e24925690404edbd9b562f87e5f91e4ed2))
* **editor:** refresh MCP landing copy-link for updated letter-frequency sample ([20a66c4](https://github.com/blueprint-chart/blueprint-chart/commit/20a66c497de16d3f3a96c86055140b440b13cdc9))

## [0.4.0](https://github.com/blueprint-chart/blueprint-chart/compare/v0.3.0...v0.4.0) (2026-06-21)

### Features

* add compactSerializeDeep for top-level default purging ([5182184](https://github.com/blueprint-chart/blueprint-chart/commit/5182184d31ad77a52cc8fc78f375655745c6d1d3))
* add floating purge-defaults button to the DSL editor ([94e9d97](https://github.com/blueprint-chart/blueprint-chart/commit/94e9d974d8d66bd70cccc7efc89df345fe0fb2bf))
* add value-label fit helper for bar charts ([be7d5a6](https://github.com/blueprint-chart/blueprint-chart/commit/be7d5a6320faa590bf2fda8537da6516e3122065))
* auto-fit value labels on grouped and stacked column charts ([32c24ed](https://github.com/blueprint-chart/blueprint-chart/commit/32c24edf4286420f894134bdf05ded375c66952f))
* auto-fit value labels on horizontal grouped, stacked, and split bars ([a97fb51](https://github.com/blueprint-chart/blueprint-chart/commit/a97fb510aa1ab1b462915bada724379d61335b8a))
* bar charts hide value-axis number labels by default ([aa3b5d5](https://github.com/blueprint-chart/blueprint-chart/commit/aa3b5d5c568a2d936a19fb32a9588c8be484f63a))
* deep inheritance-aware purge of scene and series overrides ([8abc80b](https://github.com/blueprint-chart/blueprint-chart/commit/8abc80b9f4b40ca739ffcbd72a6c6309a91ff00f))
* **editor:** add Chart + BPC option to the view toggle ([c5a6d00](https://github.com/blueprint-chart/blueprint-chart/commit/c5a6d00de92f3c6d4be8bc6971a0a927caafa132))
* **editor:** add diffEdit minimal-diff helper for DSL writes ([f1fbec1](https://github.com/blueprint-chart/blueprint-chart/commit/f1fbec118728161594ba0ec5df70adecd4772ec8))
* **editor:** add focus-aware DSL sync controller ([190070c](https://github.com/blueprint-chart/blueprint-chart/commit/190070cdd0e0de6cdff02c4dfbd62be8ed9f180f))
* **editor:** add split view mode and splitRatio to editorPanel store ([51f2c8e](https://github.com/blueprint-chart/blueprint-chart/commit/51f2c8eb4b6a8320513a8bf0188e126e06d19061))
* **editor:** collapse options panel to the icon rail in split and BPC modes ([b8f96e2](https://github.com/blueprint-chart/blueprint-chart/commit/b8f96e2f9afc895a1d0a8a98e48c7e287c73214c))
* **editor:** focus-aware DSL editor with inline diagnostics and polish ([a72fe37](https://github.com/blueprint-chart/blueprint-chart/commit/a72fe371dc683ddc31ab6f7664ab4e5fc3d6034f))
* **editor:** make the split divider draggable ([5670469](https://github.com/blueprint-chart/blueprint-chart/commit/56704692439eef37ac4ce198e76fbb0d2573022b))
* **editor:** map DSL parse errors to lint diagnostics ([277f3b6](https://github.com/blueprint-chart/blueprint-chart/commit/277f3b64fa5c70967f9ac6b60e21c98046132ec5))
* **editor:** refine split view toggle, narrow handling, mode picker ([1458dce](https://github.com/blueprint-chart/blueprint-chart/commit/1458dceb4595750908f7a1f383cabfddcd9ff8d0))
* **editor:** render chart and DSL side by side in split mode ([4ce549e](https://github.com/blueprint-chart/blueprint-chart/commit/4ce549ee0b80dbf8f0685560ae7ffa240e8163b8))
* **editor:** stack chart over DSL on narrow split view ([32b8da0](https://github.com/blueprint-chart/blueprint-chart/commit/32b8da00fb27190536a97504e7d9c05001fe9044))
* **editor:** surface parse error location from applyDsl ([64c7041](https://github.com/blueprint-chart/blueprint-chart/commit/64c704135976a46bd87ba877cec4b5aca1ff4209))
* expose canPurge and purge from the DSL editor ([42ba243](https://github.com/blueprint-chart/blueprint-chart/commit/42ba2434436970f8a67ec7289edaa20cc73ca9f3))
* horizontal bar charts hide value axis line and gridlines by default ([0817b21](https://github.com/blueprint-chart/blueprint-chart/commit/0817b21c5a28455a9d6fc83178a2ef24769e332b))
* **lib:** add dom render backend ([d275287](https://github.com/blueprint-chart/blueprint-chart/commit/d275287ddca93faa7fc939c0a5e4cd4eb6e7175a))
* **lib:** add node render backend with browser stub ([42e2e42](https://github.com/blueprint-chart/blueprint-chart/commit/42e2e42fc36de51bf03019bcc10ab338262d575b))
* **lib:** add render error types and backend interface ([85bd148](https://github.com/blueprint-chart/blueprint-chart/commit/85bd1486f913ce1290551824cba14339178170aa))
* **lib:** add toHtml() to the render handle ([3eff307](https://github.com/blueprint-chart/blueprint-chart/commit/3eff30706739c3ca1f8d65ca453ad2d701871b16))
* **lib:** add unified render() front door and chart handle ([968a036](https://github.com/blueprint-chart/blueprint-chart/commit/968a036b6715cc29fc3247753b07616a60156da1))
* **lib:** expose parse error location on SyntaxError ([a295a32](https://github.com/blueprint-chart/blueprint-chart/commit/a295a323071887565013d675b20aaad2e234748d))
* **lib:** relocate headless jsdom/text-shim/rasterize internals into render backends ([414c071](https://github.com/blueprint-chart/blueprint-chart/commit/414c0714faa0469877cfe9cec6eacd42c5470448))
* suppress unfit value labels on single-series bar charts ([c79949d](https://github.com/blueprint-chart/blueprint-chart/commit/c79949d5ea01a16ee386a464158cce0528892073))
* **ui:** support per-option tooltip on segmented control / toggle ([80f95f6](https://github.com/blueprint-chart/blueprint-chart/commit/80f95f69fd0ad397720934dcdeda2cac71960049))
* vertical bar charts default to direct labels, no value gridlines ([c474496](https://github.com/blueprint-chart/blueprint-chart/commit/c4744962231ed065e3c859218ebd0d2dc7587d06))

### Bug Fixes

* compute canPurge from editor doc, not compact canonical dsl ([c5f994d](https://github.com/blueprint-chart/blueprint-chart/commit/c5f994dc57bbf449eed7652f153d8f16ac7a4e9e))
* **docs:** externalize lib node-backend from vitepress build ([ec0f996](https://github.com/blueprint-chart/blueprint-chart/commit/ec0f9963ec0feecbf120085265adf9c2ec963714))
* **editor:** clamp diagnostic offset to line end ([426d369](https://github.com/blueprint-chart/blueprint-chart/commit/426d369c4abce4cc7166b32a4ac5c3107979faa4))
* **editor:** generate compact DSL so deleted lines aren't restored ([84bb068](https://github.com/blueprint-chart/blueprint-chart/commit/84bb0689e77cdb73a14bd4f02c923484ae37456c))
* **editor:** harden DSL sync — cancel on unmount, useTimeoutFn debounce, buffer external edits, preserve comments, share theme ([9389c9a](https://github.com/blueprint-chart/blueprint-chart/commit/9389c9aa8d51eac1e502f7ee9011867544d5d834))
* **editor:** keep options panel reachable in narrow split view ([aa675d9](https://github.com/blueprint-chart/blueprint-chart/commit/aa675d9cd47953ebc5206f938b713454690550e5))
* **editor:** match canvas auto mode to theme light/dark surface ([9e5386a](https://github.com/blueprint-chart/blueprint-chart/commit/9e5386ac3cd1fcac6e1bac94320fcd31220f5394))
* **editor:** mute DSL line numbers further ([992d73e](https://github.com/blueprint-chart/blueprint-chart/commit/992d73e899a40cc516347b7d8bf184336bf2eef2))
* **editor:** render a visible underline for end-of-line DSL parse errors ([aa8c297](https://github.com/blueprint-chart/blueprint-chart/commit/aa8c297dd8b1ef7c59b45df02e96f7df46a04d59))
* **editor:** single scrollbar, muted line numbers, hide scene timeline in DSL view ([f331084](https://github.com/blueprint-chart/blueprint-chart/commit/f331084f316120744a1842cbf12218d85473ac11))
* **editor:** square the icon-only view toggle options ([00d73fc](https://github.com/blueprint-chart/blueprint-chart/commit/00d73fc1fc083840f79a6079d9c89545f5f77667))
* **editor:** stop scene playback when leaving preview view ([b0828cd](https://github.com/blueprint-chart/blueprint-chart/commit/b0828cd6559c0f21f6ade3c14cfec05f1f938d12))
* **editor:** use stable scene ids across DSL re-parses ([a54a040](https://github.com/blueprint-chart/blueprint-chart/commit/a54a040883316ab35352cfa75696619ad3e15e8f))
* float purge button via positioned wrapper, removing bottom strip ([c554844](https://github.com/blueprint-chart/blueprint-chart/commit/c554844d37f722eb14fe80b666ef3592d62564fb))
* **ui:** square icon-only segmented-control options ([d5cae6d](https://github.com/blueprint-chart/blueprint-chart/commit/d5cae6d125c7a943844ce0c068631c2a69b2bbec))
* **ui:** support per-option title on NavigationToggle and fix item type ([ea4f2d7](https://github.com/blueprint-chart/blueprint-chart/commit/ea4f2d768929708d110a8a95b1b31aba2a43363a))

## [Unreleased]

### Features

* **Unified `render()` API.** One function returns a chart handle that works in
  both the browser and Node: `const chart = await render(bpc)`, then
  `chart.toSvg()`, `chart.toPng()` (Node-only), `chart.toHtml()`,
  `chart.mount(target)`, and `chart.scene(n)`. Handle methods are destructurable
  bound closures. The Node render path (jsdom + resvg) ships as
  `optionalDependencies` and is lazily loaded behind a conditional export, so
  browser bundles stay free of the native deps.
* **Bar charts now default to no value axis with direct value labels.** Every bar
  variant (vertical, horizontal, grouped, stacked, split) hides the value-axis
  line, ticks, numbers, and value gridlines, and labels each bar directly; labels
  that don't fit their bar are suppressed and fall back to the tooltip instead. Restore the
  previous look with `showVerticalAxis`/`showHorizontalAxis`, `verticalGridStyle`/
  `horizontalGridStyle`, or by setting `valueLabels` off.

## [0.3.0](https://github.com/blueprint-chart/blueprint-chart/compare/v0.2.0...v0.3.0) (2026-06-20)

### Features

* add point-wise SVG path interpolator for scene transitions ([e295470](https://github.com/blueprint-chart/blueprint-chart/commit/e295470f6bf2855377abbe45bf53355b7b0b4113))
* area marks resize on one clock via featureJoin + frame-geometry tween ([6eeb823](https://github.com/blueprint-chart/blueprint-chart/commit/6eeb8232158bfa75d0795900b1912def11cc9909))
* area-stacked marks resize on one clock via featureJoin + frame-geometry tween ([4b23e33](https://github.com/blueprint-chart/blueprint-chart/commit/4b23e33552bec545d3e0f7a6946ff94b5de4224b))
* bar-grouped marks resize via featureJoin migration + frame-geometry tween ([cff803d](https://github.com/blueprint-chart/blueprint-chart/commit/cff803d909c8f5121afd290b12cf1139665cb7ac))
* bar-horizontal marks resize on one clock via featureJoin reinsert + frame-geometry tween ([733de6b](https://github.com/blueprint-chart/blueprint-chart/commit/733de6b5cc8de4d08bb6aca417771f8d25423a66))
* bar-multi marks resize on one clock via featureJoin reinsert + frame-geometry tween ([a605143](https://github.com/blueprint-chart/blueprint-chart/commit/a60514350be838ec4e03159b8b968e0dc615ec89))
* bar-split marks resize via featureJoin migration + frame-geometry tween ([bfb62db](https://github.com/blueprint-chart/blueprint-chart/commit/bfb62db0fac258c947a5c824bccb4d012c6a54eb))
* bar-stacked marks resize via featureJoin migration + frame-geometry tween ([9bdd82a](https://github.com/blueprint-chart/blueprint-chart/commit/9bdd82a8e7790748fe11f415a67d668194ef7c6d))
* bar-vertical marks resize on one clock via featureJoin reinsert + frame-geometry tween ([d52c796](https://github.com/blueprint-chart/blueprint-chart/commit/d52c796908d7418aa17457ecfebd99e7b4802e47))
* **canvas:** make blueprint canvas adaptive to dark theme ([f924335](https://github.com/blueprint-chart/blueprint-chart/commit/f924335c442e5dd7fd8c04c73dcc0e21bad0e40c))
* column-stacked marks resize via featureJoin migration + frame-geometry tween ([b1e2bb0](https://github.com/blueprint-chart/blueprint-chart/commit/b1e2bb0264ecc628c76e4511e8811c66fd6c943b))
* frame-geometry tween (group transform + clip) on the scene clock ([c896e0c](https://github.com/blueprint-chart/blueprint-chart/commit/c896e0c36596f839623754632796c22693c40e32))
* line marks resize on one clock via featureJoin + frame-geometry tween ([199ebfc](https://github.com/blueprint-chart/blueprint-chart/commit/199ebfcaa0577f4bfcc22176ee13ab24161cd902))
* line-multi marks resize on one clock via featureJoin + frame-geometry tween ([c5624d0](https://github.com/blueprint-chart/blueprint-chart/commit/c5624d0d97eafa6a53ad25d9fa05266c35e5d42c))
* shared tweenPlotFrame helper + cached plot rect, plugin-host factory, distinct series-area/line roles ([c599c0f](https://github.com/blueprint-chart/blueprint-chart/commit/c599c0f91ade8baf22f4136ead8d5845a012d733))
* tween d/transform via point-wise interpolation in the orchestrator ([4a0e48a](https://github.com/blueprint-chart/blueprint-chart/commit/4a0e48af4c62c9fe8c48b283b5762dcbea9e50a5))

### Bug Fixes

* area-stacked path transitions use point-wise interpolation (no corruption) ([815ac81](https://github.com/blueprint-chart/blueprint-chart/commit/815ac81e872853535532a8427f44e7db2682c306))
* **docs:** drive dark bridge surfaces from shared tokens ([dd0ca79](https://github.com/blueprint-chart/blueprint-chart/commit/dd0ca7900e7faf86bcb38d867d8532dcde29b923))
* **editor:** token-drive dark range-slider track ([f78d23b](https://github.com/blueprint-chart/blueprint-chart/commit/f78d23b165abe560ff81fe5b6626876332643db2))
* exit area-stacked edge lines when areaLines toggles off mid-transition ([87fc3d3](https://github.com/blueprint-chart/blueprint-chart/commit/87fc3d37238d19dc72239569c53ec31e10ebb342))
* **lib:** neutralize dark blueprint-framed footer tint ([d59b5bd](https://github.com/blueprint-chart/blueprint-chart/commit/d59b5bd4e92c1cad131a99a129704039ee9fa5a1))
* reset stale highlight/opacity on reused bars across transitions ([7f73a2a](https://github.com/blueprint-chart/blueprint-chart/commit/7f73a2a130a5669cbfdd55f8c4e025fed5248a01))
* snap non-interpolable attrs, exact interpolatePath endpoints, interrupt orchestrator on non-transition render ([399e626](https://github.com/blueprint-chart/blueprint-chart/commit/399e62639cef8f75319b06a25a50680782c6c491))
* **ui:** deepen dark canvas well below the void ([494b442](https://github.com/blueprint-chart/blueprint-chart/commit/494b442a0c7726d1fb147853ab9447e283be406b))
* **ui:** unify dark surfaces on a cool-slate ramp ([01a2fd7](https://github.com/blueprint-chart/blueprint-chart/commit/01a2fd7123bce6b97cfc0e4a849f15eb5c0f3157))
* widen line-multi priorMargin type so the frame-geometry tween typechecks ([6e99fdf](https://github.com/blueprint-chart/blueprint-chart/commit/6e99fdf8a68788393dec9596f31258e35f01085d))

## [0.2.0](https://github.com/blueprint-chart/blueprint-chart/compare/v0.1.35...v0.2.0) (2026-06-19)

### Features

* **docs:** redirect home to getting-started with section tiles ([0a240c8](https://github.com/blueprint-chart/blueprint-chart/commit/0a240c84582e01065fa2f2bfb3545ef5d366005b))
* **dsl:** add optional leadingComments to AST node types ([56f1135](https://github.com/blueprint-chart/blueprint-chart/commit/56f113598015025af655759c47ce263879029f65))
* **dsl:** capture leading // comments into AST nodes ([bff9498](https://github.com/blueprint-chart/blueprint-chart/commit/bff949870e67d814b0bafc0b6d75acdda0bac9e0))
* **dsl:** serialize leadingComments above their nodes ([307ada4](https://github.com/blueprint-chart/blueprint-chart/commit/307ada46cf5a2c82f58fabc6c8d924788bd8be83))
* **samples:** add didactic // comments to the CO₂ samples ([d6a3334](https://github.com/blueprint-chart/blueprint-chart/commit/d6a3334cab7ab172e3ece5eb074c561874eabdec))

### Bug Fixes

* **dsl:** handle multi-line comments and discard inline trailing comments ([1e2f920](https://github.com/blueprint-chart/blueprint-chart/commit/1e2f9201612fc1e626dd9f774dab5101d46878e8))

## [0.1.35](https://github.com/blueprint-chart/blueprint-chart/compare/v0.1.34...v0.1.35) (2026-06-13)

### Bug Fixes

* verify automated release and site deploy pipeline ([a33d112](https://github.com/blueprint-chart/blueprint-chart/commit/a33d11272a71624e4d3c697b16188e2b30b232e4))

# Changelog

All notable changes to Blueprint Chart are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Versions are published from `origin/main` and tagged `vX.Y.Z`; all three workspace
packages (`@blueprint-chart/lib`, `@blueprint-chart/ui`, `@blueprint-chart/editor`)
share a single version.

## [0.1.32] — 2026-06-05

### Fixed

- exported SVG and PNG images now carry the chart background: the chart SVG embeds a background rect resolved from the frame theme, omitted when the BPC sets `transparentBackground = true`. Bare-SVG consumers (MCP renders, resvg rasterization) previously produced transparent images regardless of the BPC.

## [0.1.31] — 2026-06-05

### Fixed

- the bundled samples and docs no longer use the dead `dy` annotation key (silently ignored by the renderer); `textOffsetY` replaces it, and a guard test now requires every bundled sample to pass `validateChart` with no errors or warnings.

## [0.1.30] — 2026-06-05

### DSL

- **BREAKING**: `areafill` renamed to `area-fill`.
- **BREAKING**: `hide_annotation` / `show_annotation` renamed to `hide-annotation` / `show-annotation`.
- **BREAKING**: `hide_range` / `show_range` renamed to `hide-range` / `show-range`.
- **BREAKING**: `hide_note` / `show_note` renamed to `hide-note` / `show-note`.
- **BREAKING**: the data meta-row key `_series` renamed to `series` (unquoted; quoted labels stay data rows).
- **BREAKING**: the `step` alias for `scene` removed; old keyword forms are now parse errors with no backward-compatible fallback.
- **BREAKING**: the unused `StepNode` type alias removed from the public API.
- a quoted `"series"` data row now survives round-trips as a real data category instead of being re-read as the column header.

### Added

- value-level validation via `validateChart`: unknown chart types, property keys, enum and boolean values, transform types, and annotation body keys all get errors with did-you-mean suggestions; suspicious `series` meta-rows get warnings.
- friendly parser errors with line/column for duplicate data blocks and missing quoted targets on `colorize`, `highlight`, `annotation`, `area-fill`, and `series`.
- embeds now render a visible error message when a chart fails to parse or render, instead of staying blank.
- two new bundled samples: `bitcoin-price.bpc` and `co2-emissions-story.bpc`.
- a "Was this page helpful?" feedback link on every docs page.
- shared `ANNOTATION_KIND_KEYWORD` map exported from the lib.

### Changed

- the editor's syntax highlighter now understands the full language: visibility directives, bodyless `highlight`, block comments, and scientific-notation numbers.

### Fixed

- duplicate `data` block error now reports the offending line/column.
- a malformed `highlight` body now reports the error inside the body instead of a confusing stray-brace message.
- DSL documentation corrections across the reference pages (comment syntax, number and escape grammar, annotation `start`/`end` keys, round-trip and versioning scope); guard tests now pin every docs snippet and sample reference to the canonical grammar.

## [0.1.27] — 2026-06-03

### Added
- add AccountAvatar initial-badge component
- add account menu to landing nav, remove GitHub button
- add cloudCharts store (CRUD, publish, fetch-published)
- add DashboardSyncPill component
- add debounced cloud sync composable
- add lazy code-split Supabase client factory (PKCE)
- add local→cloud import composable
- add magic-link account store
- add mergeChartLists for unified chart model
- add publish + id-link options to export panel (gated)
- add reusable ExportEmbedBlock for one embed type
- add runtime Supabase config resolution with accountsEnabled gate
- add sign-in modal and navbar account menu (gated)
- add #status slot overlay to GalleryCard
- add supabase dependency and config typing scaffolding
- add unmarkCloudBacked to cloud index
- add useCloudSave composable for explicit cloud save
- anchored edit, sync-to-cloud and confirmed delete in detail panel
- brand Supabase magic-link and signup confirmation emails
- brand the sign-in modal with value-led copy and benefit rows
- cache thumbnail+preview from a DSL string
- clarify the two embed types across all four states
- cloud-primary dashboard with local import banner
- forward sync/open events through the gallery
- hide sync affordances when signed out and soften card status pill
- let users return to the form from the sent confirmation
- lift sign-in modal open-state into the account store
- link the MIT value-prop cell to the GitHub repo
- make bulk sync id-preserving and keep local copies
- make delete confirmation a modal
- polish account menu with avatar toggle, identity header, and primary sign-in CTA
- purge synced charts from local storage on sign out and redirect to dashboard
- render published charts via /render?id=
- render sync pill in dashboard toolbar
- replace import banner with toolbar sync pill
- reset sign-in modal to the form each time it opens
- resolve config and handle PKCE auth redirect during boot
- reword import banner as sync-all-to-cloud
- show sync-status pill on chart cards
- unified dashboard charts composable with sync/remove/duplicate
- unify local and cloud charts in one dashboard list
- wire continuous cloud sync for owned charts (edit + new + cloud-open)

### Fixed
- add td to border-collapse reset in branded emails
- align account menu toggle height with navbar btn-sm controls
- dashboard cold-load refresh and scroll containment
- delete cloud-only charts even when absent from the local cloud index
- drop brand row from sign-in modal, lead with the headline
- gate publish on cloud-backed chart and reflect real published state
- grant table privileges to anon/authenticated on charts
- guard publish-state race and make embed-panel hints buttons
- hide the live-link hint when the cloud is not configured
- keep useCloudSave saving flag reset on failure
- lay out account menu header avatar beside the identity text
- make charts migration usable with supabase db push
- make dashboard cloud-mode actions operate on cloud charts
- memoize account init() so concurrent callers await session restore
- offset account menu dropdown to sit just below the navbar
- pin account menu dropdown above app chrome z-index
- purge synced charts before sign-out so the dashboard list refreshes correctly
- round card background and border together in branded emails
- scope sign-in modal body, use AppIcon spin, add close focus ring
- shrink navbar toggle avatar for breathing room inside the button
- stop listing the cloud-index key as a phantom chart
- use defined design tokens for ExportEmbedBlock font sizes
- use no-footer so delete modal shows only its custom buttons
- use no-footer so sign-in modal shows only its own form
- use the in-cloud icon for cloud-only charts on the dashboard

### Changed
- bind AccountMenu sign-in modal to shared store state
- cap account menu width to the viewport on small screens
- dedupe initial dashboard refresh and guard bulk sync
- dedup storage-key helpers and iframe sizing in cloud feature
- drop redundant vue import and static-string computed in detail actions
- extract summarizeDsl helper from listSavedCharts
- let AccountMenu own session init, drop navbar call
- match export embed section titles to .form-label
- persist cloud-only previews and make metadata enrichment reactive-safe
- resolve lint errors in dashboard chart tests
- satisfy eslint for landing account-menu changes
- use static imports in router cloud-load to silence build warnings

_+11 docs/test/build/ci commits._

## [0.1.26] — 2026-06-02

### Added
- add charts table migration with RLS policies
- clearer, plainer hero sub-paragraph
- fold the AI-writable angle into the value strip
- lead hero with the AI/format wedge
- neutral open-source footer tagline
- renumber AI section to 01
- renumber defaults to 03, keep newsroom rigor as credibility
- renumber format section to 02
- renumber scenes section to 05
- renumber transforms section to 04
- reorder nav menu to match new spine
- reorder spine to lead with AI then format

### Changed
- rewrap copy lines and align LandingPage imports with spine order

_+9 docs/test/build/ci commits._

## [0.1.25] — 2026-06-01

### Added
- add percent type + converter parse + percentValueLabel formatter
- add shared buildColorOverrides helper
- apply colorize; omit redundant opacity when unhighlighted
- apply colorize to arcs; omit redundant opacity when unhighlighted
- apply colorize to series via shared override map
- valueLabels='percent' renders share of column
- valueLabels='percent' renders share of total

### Fixed
- parse chart-level valueLabels='percent' too

### Changed
- use shared buildColorOverrides

## [0.1.24] — 2026-06-01

### Added
- add shared highlight-dim helper
- dim non-highlighted arcs via shared helper
- dim non-highlighted series via shared helper

### Changed
- drop redundant parens around arrow argument
- standardise class-event highlight dim to shared 0.35
- standardise highlight dim to shared 0.35

## [0.1.23] — 2026-06-01

### Fixed
- showArrow implies showLine + clamp text Y to canvas

_+1 docs/test/build/ci commits._

## [0.1.22] — 2026-05-31

### Added
- add floating variant to SceneTimeline
- add timeline slot to chart-edit canvas
- add timeline slot to data-structure canvas
- float the wide-mode scene-timeline over the canvas

### Fixed
- open command palette when landing search pill is clicked

### Changed
- pass copy deep-link payload via bpc64 query param

## [0.1.21] — 2026-05-30

### Added
- add LandingMcp "Author with AI" section
- expand the LandingMcp demo conversation
- redesign LandingMcp as a chat window with a stepper
- use a static chart image in LandingMcp
- wire LandingMcp into the landing page and nav

### Fixed
- fix the data pipeline demo layout on narrow screens
- rework the LLM format footnote

_+7 docs/test/build/ci commits._

## [0.1.20] — 2026-05-23

### Fixed
- ensure dist/ is built before publish via prepublishOnly

## [0.1.19] — 2026-05-23

_+3 docs/test/build/ci commits._

## [0.1.18] — 2026-05-23

### Added
- expose Node API (listDocs, getDoc) and make package public
- extract recommendCharts into lib as a pure function
- generate dist/manifest.json at build time

### Changed
- split single-line if-blocks across recommender and docs api

_+1 docs/test/build/ci commits._

## [0.1.16] — 2026-05-23

### Added
- add core types for scene transition orchestrator
- add ensureClipPath helper for deterministic clip ids
- add featureJoin primitive (idle path)
- add SceneTransition lifecycle and registry
- add snapshotLiveAttrs helper
- add transitionMode to RenderOptions
- add useSheetNumber composable
- buffer features during commit and tween on animate
- drive SceneTransition lifecycle from renderChart
- expose orchestrator and primitives from lib
- honour prefers-reduced-motion at the orchestrator
- migrate bar-horizontal marks and value labels to featureJoin
- migrate bar-multi cells to featureJoin
- migrate bar-vertical marks to featureJoin
- migrate bar-vertical value labels to featureJoin
- migrate donut slices to featureJoin
- migrate pie slices to featureJoin
- persist sheetNumber and sheetId on chartSession
- render frame credit as a clickable link to baseUrl
- scaffold cross-type role-matcher
- warn-once and snap for unknown transition modes

### Fixed
- add 2px buffer in inside-label mode to prevent edge clipping
- apply scene title/description/source overrides to returned frame
- balance spacing above and below top legend
- bar family lifecycle, namespaced legend handlers, and data-series keyed by name
- cache post-paint footer height to handle teleported content
- cancel inflight fade overlays and strip stale snapshots on rapid swaps
- dispose proximity tooltip, interrupt axis transitions, and use ensureClipPath in line family
- fade only chart body on cross-type transition to keep footer stable
- give fade overlay a flex layout so snapshot fills it
- guard contrast helpers against invalid hex strings
- harden SceneController against NaN, Infinity, empty, and destroyed inputs
- keep horizontal-axis label positioning aligned through merge:transition
- keep inside y-axis labels positioned through merge:transition
- make computeLinearDomain robust for large data and log scales
- mark non-numeric cells undefined in parseData
- parse dates as UTC and pick the format that matches every label
- preserve highlight body, accept top-level visibility, comments, scientific notation, and dedup data
- preserve same-value axis ticks across scene renders
- relax constrained frame to live header/footer heights
- remove anchor underline from frame credit
- restore tickTextSel transition-aware positioning (accidentally reverted)
- scope line-symbol selectors by tag to prevent stale shape DOM
- share a single message router across blueprint scripts
- skip annotation enter/move animation when identical across scenes
- style fade-snapshot frames so cross-type crossfade is visible
- tag body-form highlight as colorize to preserve visual semantics on round-trip
- threshold axis margin-delta compensation to >=1px
- use diverging offsets in stack helpers
- wire scene data, accumulate annotations, transform sort, stripColors, theme and layout resets

### Changed
- drop showCredit field from ChartLayout
- drop showCredit option from FrameOptions
- narrow frame-property type before assignment
- satisfy lint after stage 2 migration
- simplify horizontal-axis target ternary
- split one-line statements to satisfy lint
- stop reading showCredit from chart layout
- tighten em-dash comment spacing in useSheetNumber

_+15 docs/test/build/ci commits._

## [0.1.15] — 2026-05-22

### Added
- add LayoutNarrowDock
- add PanelOpenButton pill
- add per-step icons with done-state check swap to NavigationStepperTabs
- add SceneListItem
- add SceneList vertical layout (no reorder yet)
- add SceneTimelineCompact skeleton
- add stacked layout to NavigationStepperTabs
- add WAI-ARIA arrow/home/end keyboard nav to NavigationStepperTabs
- export NavigationStepperTabs, drop NavigationStepperChevron export
- export SceneList + SceneListItem
- export SceneTimelineCompact
- export StepEntry and add focus-visible to NavigationStepperTabs
- render chevron separators between inline NavigationStepperTabs
- render icons in PanelTabBar tabs and drop horizontal row padding
- render LayoutNarrowDock on narrow viewports
- render SceneList inside the narrow scenes sheet
- scaffold NavigationStepperTabs with renders-one-tab-per-step test
- swap WizardShell stepper to NavigationStepperTabs with breakpoint layout
- track last narrow tab on editorPanel store
- track last narrow tab on exportPanel store
- wire sortablejs drag-reorder into SceneList

### Fixed
- address critical/important code-review findings
- address final review (counter dedup, aria-expanded, test mocks)
- address minor code-review findings
- address scenes-sheet review (ts mock types, role=list, remove e2e)
- make LayoutBottomDrawer content-driven with 70vh cap
- move scene-list-item border to row wrapper so remove sits inside
- pin scene-list-item remove to top-right of the row

### Changed
- drive DataStructurePanel drawer via lastNarrowDataTab
- drive ExportPanel drawer from exportTab
- extract panel-section composables shared by rail and tab bar
- match PanelTabBar active state to navigation rail (primary pill)
- remove drag-reorder from SceneList (out of scope)
- remove horizontal rail from ChartEditPanel

_+15 docs/test/build/ci commits._

## [0.1.14] — 2026-05-21

### Added
- add --bc-drawer-height token

### Fixed
- raise LayoutBottomDrawer backdrop to z-index 1049

### Changed
- collapse light-mode --bc-content-bg to match --bc-tile-bg-elevated
- drop ButtonDetach, ButtonDock, ButtonDrag (floating-only)
- drop dead --bs-tertiary-bg fallback from LayoutPanel toolbar
- drop floating branch from shell and docked chrome
- drop page-header z-index override now drawer is modal
- emphasize active button with filled primary pill
- harmonize CodeMirror DSL surface to --bc-tile-bg-elevated
- harmonize ExportEmbedPanel code-block header to --bc-tile-bg-elevated
- harmonize FormatCard options background to --bc-tile-bg-elevated
- harmonize GalleryCard thumb background to --bc-tile-bg-elevated
- harmonize LayoutPageHeader background to --bc-tile-bg-elevated
- icon rail toggle now flips docked and closed
- narrow page tabs-slot guard to drawer-only
- pin LayoutBottomDrawer height to --bc-drawer-height
- remove floating mode from store
- remove PanelFloating component and panel-drag composable
- split saved indicator into compact dot and full pill

_+5 docs/test/build/ci commits._

## [0.1.13] — 2026-05-20

### Fixed
- use pnpm 11 allowBuilds syntax for esbuild and @parcel/watcher

_+5 docs/test/build/ci commits._

## [0.1.12] — 2026-05-20

_+1 docs/test/build/ci commits._

## [0.1.11] — 2026-05-20

_+1 docs/test/build/ci commits._

## [0.1.10] — 2026-05-20

### Added
- add astToDefinition
- add cross-type fade orchestration
- add cta-secondary slot to NavigationDocsBar, pin spacer between actions and ctas
- add layout-constraints helper
- add NavigationDocsBar component
- add NavigationMarketingBar component
- add NavigationSectionDropdown for sidebar section switching
- add NavigationSectionTabs component for docs section nav
- add post-render class application
- add renderChart orchestrator
- add render module types
- add resolveScene with cascading fold
- add sceneOverrideToSceneNode adapter
- add useCurrentSection composable resolving active section from nav[]
- add useDocsTheme composable with 3-state cycle
- adopt useDocsTheme + phosphor icons in marketing bar
- bump type scale to looser reading-friendly values
- consolidate design tokens into tokens.scss
- export NavigationDocsBar
- export NavigationMarketingBar
- expose renderBpc/renderChart unified API
- extract LayoutBreadcrumb from LayoutNavbar
- import shared design tokens from @blueprint-chart/ui
- move brand into sidebar, offset slim nav, restructure slot order
- NavigationCommandBar gains collapsed icon-only mode
- override VitePress layout with shared nav components
- remove navbar section tabs, keep dropdown as sole cross-section affordance
- store docked panel width as viewport fraction, default 22%
- wire section tabs into navbar and section dropdown into sidebar

### Fixed
- add 0.25rem margin to sidebar brand logo
- add pill padding and pin sidebar to left edge at ≥1440px
- add search trigger button to nav
- add theme toggle and proper GitHub button, fix nav to position fixed
- add -webkit-backdrop-filter to NavigationMarketingBar for Safari 14-17
- align NavigationSidebar header with navbar row
- always create frame DOM when not in thumbnail mode
- blur and translucent backdrop on NavigationDocsBar
- blur and translucent backdrop on slim navbar
- bridge --bs-body-color / --bs-secondary-color to VP text vars
- bump GitHub-hide specificity to beat scoped button display
- bump sidebar selector specificity to win in dev mode
- center group eyebrow vertically in its flex row
- center navbar tabs by moving auto margins onto brand slot
- click VP search button directly to open modal
- close NavigationSectionDropdown panel when a menuitem is selected
- correct tokens export path and skip partials in styles emit
- default percent suffix on y-axis when stackPercent is on
- drive --vp-nav-height from isHome via JS
- drop hardcoded z-index from NavigationDocsBar so docs search modal stacks above
- even gaps across NavigationMarketingBar sections, hold brand-menu spacing
- even spacing across landing nav buttons by colocating My charts in #actions
- import ui library css bundle so component styles ship to docs
- inflate clip path to avoid stroke clipping at plot edges and drop redundant inline stroke-width
- inherit body line-height on brand so baseline matches navbar
- interpolate palette when fewer colors than slices and suppress trivial center total when displayAsPercentage
- keep category x-axis labels visible on narrow charts
- keep search on left, push right only on narrow
- landing nav matches narrow logic — collapse search, hide GitHub, keep brand
- make sidebar group span full nav width
- match editor bc-theme storage format, restore bidirectional sync, hide empty brand wrapper
- match editor workspace switcher logo size and line-height
- match sidebar width to VP's 272px
- NavigationSectionDropdown global Escape + focus return to trigger
- NavigationSidebarItem uses 14px (--bs-font-size-sm)
- no-wrap docs brand wordmarks in sidebar and top nav
- no-wrap nav buttons and hide GitHub on narrow
- pin NavigationCommandBar kbd line-height so docs renders chip at editor's height
- place narrow-mode search before cta buttons on the right
- point hamburger at VPLocalNav .menu so it actually opens the sidebar
- prevent package-name wrap in README and getting-started tables
- raise highlight dim opacity from 0.2 to 0.35 for dark-mode visibility
- remove ClientOnly wrapper to avoid hydration FOUC
- reserve VPContent top padding under 960px so fixed nav stays clear of content
- restore labeled GitHub button on wide viewports
- show Blueprint Chart wordmark in narrow navbar
- swap search icon for NavigationCommandBar input pill
- tighten sidebar padding and align brand with navbar row
- tokens dark block honors .dark selector for VitePress-style consumers
- unify editor + docs marketing nav order to [search][gh][theme]
- use --bc-radius-xs token in NavigationSectionTabs
- use Geist Sans family name to match editor convention
- use theme token for label colors and lift default font size to 12px
- widen sidebar section switcher to item column, tighten spacing

### Changed
- BpcPreview uses renderBpc
- consume design tokens from @blueprint-chart/ui
- dashboard header shows breadcrumb instead of h1
- drop breadcrumb from LayoutNavbar, move search left
- fix remaining lint violations across docs and editor
- harmonize sidebar with editor NavigationSidebar
- LandingTopNav consumes NavigationMarketingBar
- lint
- prune theme style.css to VP-token aliases
- push navbar search to the right, collapse on narrow
- renderDsl wraps renderBpc
- restore rationale comments and relocate dark-mode form overrides
- sidebar item labels shift sm→md
- strip redundant defaults from all .bpc samples
- strip redundant defaults from temperature-anomaly
- tighten useCurrentSection types and drop unused index-strip
- unify nav cta slot vocabulary to cta-primary
- use 0.375rem horizontal padding for editor parity
- useChartPreview uses renderChart
- useChartThumbnail uses renderBpc/renderChart
- wizard header shows breadcrumb instead of chart title h1

_+26 docs/test/build/ci commits._

## [0.1.9] — 2026-05-18

### Fixed
- rephrase runtime feature blurb so YAML doesn't inject a literal script tag

## [0.1.8] — 2026-05-18

### Added
- add Bootstrap breakpoint constants module
- add BpcBlock with code/preview tabs and 'Open in editor' deep link
- add canvas-cramped axis to panel store
- add /charts catalogue covering all 13 chart types
- add /copy/:base64 hash route to hydrate sessions from URL-safe BPC payload
- add Documentation and GitHub links to sidebar Resources group
- add /handbook dataviz section with 11 KB-sourced pages
- add usePanelCanvasSync composable
- clamp PanelDocked displayed width by canvas room
- clamp PanelFloating max-width to container bounds
- close-button slot in LayoutSidebar header for offcanvas
- consolidate top nav and sidebar across guide, charts, handbook, spec, api
- enrich /guide pages with real BPC samples from the lib catalogue
- expand /guide with scenes, palettes, accessibility, data transforms, and DSL editor
- export BOOTSTRAP_BREAKPOINTS from package barrel
- hamburger + logo leading cluster in LayoutNavbar
- illustrate /handbook principles with real BPC samples
- link landing URL bar to the actual embed render route
- match editor theming with Geist + DM Serif and Prussian palette
- NavigationSidebarItem supports external href links with trailing indicator
- reopen panel from PanelIconRail when selecting a tab while closed
- scaffold @blueprint-chart/docs VitePress site with guide, DSL spec, and API reference
- sidebar in BOffcanvas at narrow viewports
- swap synthesized snippets for real samples in /spec and /api
- useBreakpoint accepts symbolic Bootstrap breakpoint names
- wire canvas-cramped detection in PanelShell

### Fixed
- clamp floating panel position on mount and container resize
- drop grid row-gap on stacked LayoutPageHeader so border-top is sole divider
- drop line symbols on farm-compass vegetable and jobs scenes
- drop priors whose series is gone from next line-multi scene
- lift sidebar offcanvas z-index above page chrome (1050/1055)
- lower cramped threshold to 480 so panel width-clamp has visible range
- measure parent flex container to break cramped oscillation
- migrate chart.scss themes from @import to @use for Sass 3.0 compat
- preserve every category x-axis label regardless of chart width
- remove width transition that lags canvas-driven clamp
- slave line-multi symbols to their series across scene transitions
- teleported BOffcanvas body padding needs global rule

### Changed
- add hairline left border to NavigationIconRail vertical variant
- add soft-pill BBadge overrides for info and success variants
- collapse sidebar into offcanvas below xl (1200px), was md (768px)
- drop manual editor link from chart pages now that BpcBlock provides it
- inset sample card thumbnails with internal padding
- LayoutShell uses Bootstrap media-breakpoint-down mixin
- remove BOffcanvas body padding around LayoutSidebar
- replace ad-hoc series colors with palettes and highlights
- tighten default chart vertical margins
- use BBadge variant=info for landing hero eyebrow
- use BBadge variant=success for wizard saved-at label

_+13 docs/test/build/ci commits._

## [0.1.7] — 2026-05-18

_+2 docs/test/build/ci commits._

## [0.1.6] — 2026-05-17

### Added
- add .bc-display utility for DM Serif Display headlines
- add --bc-shadow-overlay token
- add LandingDefaultCard primitive
- add LandingDefaults merging Philosophy + Practices
- add LandingValuePropStrip with hairline reflow
- add LayoutSceneTimeline chrome wrapper
- add LayoutSidebar with workspace + recent groups
- add motion and focus tokens with reduced-motion fallback
- add NavigationCommandBar ⌘K trigger pill
- add NavigationSegmentedControl primitive
- add NavigationSidebar container
- add NavigationSidebarGroup with eyebrow label
- add NavigationSidebarItem with pill active state
- add NavigationStepperChevron primitive
- add NavigationWorkspaceSwitcher with initial badge
- add sticky hairline top nav with brand, links, CTAs
- adopt Geist Sans as the body font stack
- btn-outline-secondary inherits the wash + hairline treatment
- btn-secondary adopts segmented-control wash + hairline
- DM Serif Display title, chrome-surface scene timeline
- export NavigationSegmentedControl
- export NavigationSidebar* and NavigationCommandBar
- export NavigationStepperChevron
- extend tile token scale with radius variants
- float navbar and merge page-header into composite tile
- GalleryCard supports serifTitle modifier
- import DM Serif Display, Geist Sans, and Geist Mono
- introduce two-tone surface, hairline, and radius tokens
- LandingFormat carries static-first story
- LandingHero copy, sample swap, mobile chart visible
- LandingPage adopts new spine, drops dividers + OSS slab
- LandingTopNav adopts new link roster + GitHub pill
- landing topnav theme toggle, alignment, hero polish, format URL, scenes player
- NavigationSegmentedControl story
- NavigationStepperChevron story
- NavigationWorkspaceSwitcher accepts logoSrc and hideName
- NavigationWorkspaceSwitcher accepts optional to prop for routing
- PanelDocked uses hairline left-border on content surface
- pulse-dot eyebrow pill, hairline chart frame, radial wash
- render My Charts title in DM Serif Display
- restyle GalleryCard with hairline border and Prussian selection
- rewrite LandingHero around 'great stories, great data viz'
- SceneTimelineItem adopts hairline tokens and Geist Mono label
- SectionTitle adopts DM Serif Display headline treatment
- sidebar workspace switcher links to home
- use DM Serif Display for chart card titles
- wash tokens, compact density, drop dead brand-gradient

### Fixed
- align content tiles with header by removing doubled padding
- DashboardToolbar controls use default md size for alignment
- declare vue-router as peer + dev dep to fix TS2307 build errors
- drop border-radius on ChartEditDsl cm-editor
- drop wizard back button — breadcrumb already routes to charts
- flatten export canvas + scene timeline chrome conflict
- full-height sidebar, narrow-viewport collapse, flush page header
- LandingDefaultCard uses --bc-tile-bg + --bs-info-bg-subtle
- LandingDefaults chart tile uses --bc-radius-lg
- LandingFormat removes spurious computed, adds URL aria-hidden, polish
- landing internal links use router-link + hash scrollBehavior
- LandingScenes theme mock + drop no-op order rule
- LandingTopNav GitHub link points to canonical repo
- NavigationCommandBar height matches btn-sm for toolbar alignment
- NavigationSegmentedControl renders slot for child entries
- pin .dropdown-toggle to .btn token chain
- post-review cleanup — breadcrumb topbar, drop dead timeline slot
- section hairlines + surfaces, Scenes order, E2E mobile asserts
- sidebar workspace switcher shows Blueprint Chart name
- strip dashboard + chart-edit tile chrome, drop wizard y-gap

### Changed
- apply lint --fix to Navigation primitives
- bump LayoutNavbar to 2.75rem and pad to 1.25rem
- CanvasModePicker adopts overlay tokens
- DashboardDetailPreview uses canonical radius tokens
- DashboardMetaChip uses canonical radius token
- DashboardToolbar uses NavigationSegmentedControl
- DataPanel uses canonical tokens
- drop em-dashes from landing copy in favor of commas, colons, periods
- flatten DataStructurePanel main surface
- LandingFooter joins chrome surface, single row
- LandingHero SFC order, explicit mobile overflow
- LandingScenes flips grid, chart-on-top mobile
- LandingSectionHeader eyebrow goes mono + faint
- LandingTopNav theme toggle moves to far right
- LandingTransforms hover token, SFC order, test stub cleanup
- LandingTransforms uses LandingDefaultCard, trims to 4 cards
- LandingValuePropStrip uses semantic section + dl/dt/dd
- LayoutBottomDrawer adopts overlay tokens
- migrate canvas, chart and dashboard surfaces to tile tokens
- migrate sub-components to explicit hairline tokens
- Navigation primitives consume --bc-wash-* tokens
- NavigationSegmentedControl active uses primary bg, .btn-matched md
- NavigationToggle uses NavigationSegmentedControl
- PanelFloating adopts overlay tokens
- PanelTabBar uses canonical radius token
- pill active state on panel tabs
- reshape LayoutNavbar into 40px topbar
- restructure LayoutShell into sidebar/topbar/main grid
- WizardShell uses NavigationStepperChevron

_+14 docs/test/build/ci commits._

## [0.1.5] — 2026-05-16

### Added
- add CommandPaletteModal
- add LayoutPageHeader frame component
- add NavigationLink primitive
- add NavigationSearchPill primitive
- add NavigationStepperTabs primitive
- add usePlatformShortcut composable
- center wizard step nav via LayoutPageHeader center slot

### Fixed
- always show navbar border and put navbar below modal stack
- create annotated tags so --follow-tags pushes them
- install BootstrapVueNext plugin and stylesheet for modals
- keep navbar clickable above bottom-drawer backdrop
- polish wizard tier 2 with tab stepper, round back button, edge-aligned header
- stack LayoutPageHeader on mobile to keep tier 2 content visible
- use canonical thumbnail helpers in CommandPaletteModal
- use shown event and disable BModal autofocus to focus search input

### Changed
- align NavigationLink with AGENTS conventions
- align NavigationPillBase sizes with Bootstrap button heights
- apply BEM root and SFC order in Dashboard files
- drop unused default slot from LayoutPageHeader
- enable parallel execution
- fix navigation selector, trim waits, strip unasserted logs
- move wizard chrome into LayoutPageHeader with saved status
- place layout selector before sort in DashboardToolbar
- render LayoutPageHeader as Dashboard tier 2 with New chart action
- replace inline :class literals with computed bindings
- replace LayoutNavbar theme conditionals with lookup maps
- rework LayoutNavbar to tier-1 only with right-aligned search
- tidy LayoutShell prop binding and types
- tidy WizardShell renderOne signature and comments
- tighten CommandPaletteModal ARIA and styles
- tighten wizard saved-status types and tests
- use useSlots() for LayoutPageHeader mode detection
- wire navbar to command palette in LayoutShell

_+7 docs/test/build/ci commits._

## [0.1.4] — 2026-05-15

### Fixed
- extract dist artifact under packages/ for downstream jobs

_+1 docs/test/build/ci commits._

## [0.1.3] — 2026-05-14

### Fixed
- build lib and ui before editor in build-editor target

_+1 docs/test/build/ci commits._

## [0.1.2] — 2026-05-14

### Fixed
- correct types for ButtonIcon.type, popover ignore option, and NavigationToggle disabled
- drop vitest preset from auto-import to keep it out of runtime bundle
- make plugin factories generic in TData so they apply to typed charts
- pass element + datum generics to selectAll so .data keyFn picks up datum type
- relax computeMarginDelta priorMargin type to match callers
- silence remaining d3 type quirks (transition/selection union, axis tickValues cast)
- use enum members instead of bare string literals for enum-typed fields
- widen scale unions to include ScaleSymLog across axis service and annotations

_+5 docs/test/build/ci commits._

## [0.1.1] — 2026-05-14

Initial public release: the D3 charting engine (`lib`), the Vue 3 component library (`ui`), and the editor SPA (`editor`), published to npm under `@blueprint-chart/*` with GitHub Pages deploy. Ships the BPC DSL parser/serializer, 13 chart types, scenes, standalone + embed export, light/dark theming, and the WCAG/CVD accessibility toolkits.
