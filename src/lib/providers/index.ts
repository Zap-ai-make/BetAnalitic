import { CachedDataProvider } from "./cachedDataProvider"
import { BetAnalyticProvider } from "./betanalyticProvider"
import type { DataProvider } from "./dataProvider"

export * from "./types"
export * from "./dataProvider"
export { BetAnalyticProvider } from "./betanalyticProvider"
export { CachedDataProvider } from "./cachedDataProvider"

/**
 * Default data provider: BetAnalytic with in-memory cache.
 */
export function createDataProvider(): DataProvider {
  if (!process.env.BETANALYTIC_API_URL) {
    throw new Error("BETANALYTIC_API_URL environment variable is required")
  }
  return new CachedDataProvider(new BetAnalyticProvider())
}

let _dataProvider: DataProvider | null = null

export function getDataProvider(): DataProvider {
  if (!_dataProvider) {
    _dataProvider = createDataProvider()
  }
  return _dataProvider
}
