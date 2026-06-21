/** Thrown when a BPC source cannot be parsed/resolved before any output is produced. */
export class ChartParseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ChartParseError'
  }
}

/** Thrown when toPng() is called in a browser environment (PNG export is Node-only in v1). */
export class PngBrowserUnsupportedError extends Error {
  constructor(message = 'PNG export is only available in Node. Use toSvg() in the browser.') {
    super(message)
    this.name = 'PngBrowserUnsupportedError'
  }
}

/** Thrown when the Node render backend's optional dependencies are missing or failed to install. */
export class MissingNodeRenderDepsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MissingNodeRenderDepsError'
  }
}
