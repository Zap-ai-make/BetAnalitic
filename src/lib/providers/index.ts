import { SportmonksProvider } from "./sportmonksProvider"
import { CachedDataProvider } from "./cachedDataProvider"
import type { DataProvider } from "./dataProvider"

export * from "./types"
export * from "./dataProvider"
export { SportmonksProvider } from "./sportmonksProvider"
export { CachedDataProvider } from "./cachedDataProvider"

/**
 * Create the default data provider
 * Uses Sportmonks with caching
 */
export function createDataProvider(): DataProvider {
  const apiKey = process.env.SPORTMONKS_API_KEY

  if (!apiKey) {
    throw new Error(
      "SPORTMONKS_API_KEY environment variable is required"
    )
  }

  const sportmonks = new SportmonksProvider(apiKey)
  const cached = new CachedDataProvider(sportmonks)

  return cached
}

/**
 * Singleton instance for server-side use
 */
let _dataProvider: DataProvider | null = null

export function getDataProvider(): DataProvider {
  if (!_dataProvider) {
    _dataProvider = createDataProvider()
  }
  return _dataProvider
}
