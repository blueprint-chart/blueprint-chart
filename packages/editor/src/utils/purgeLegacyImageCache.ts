const LEGACY_IMAGE_KEY = /^blueprint-chart:.+:(thumbnail|preview)(:light|:dark)?$/

export function purgeLegacyImageCache(storage: Storage = localStorage): void {
  Object.keys(storage)
    .filter(key => LEGACY_IMAGE_KEY.test(key))
    .forEach(key => storage.removeItem(key))
}
