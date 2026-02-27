export const CHART_CSS = `
.bc-frame { font-family: system-ui, -apple-system, sans-serif; }
.bc-frame-title { color: #333; margin: 0; font-size: 1.25rem; }
.bc-frame-description { color: #555; margin: 0.25rem 0 0; font-size: 0.875rem; }
.bc-frame-footer { margin-top: 0.5rem; gap: 0.25rem; }
.bc-frame-footer-left { display: flex; align-items: baseline; gap: 0.5rem; }
.bc-frame-footer-left > :not(:first-child)::before { content: "·"; margin-right: 0.5rem; color: #888; }
.bc-frame-note { font-style: italic; color: #888; font-size: 0.75rem; margin: 0.5rem 0 0; }
.bc-frame-byline, .bc-frame-source { color: #888; font-size: 0.75rem; }
.bc-frame-credit { font-size: 0.75rem; font-weight: 600; color: #666; }
.bc-frame-source-link { color: inherit; text-decoration: underline; }
.blueprint-chart-error { color: red; padding: 1em; border: 1px solid red; }
body { margin: 0; overflow: hidden; }
`
