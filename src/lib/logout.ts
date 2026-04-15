/**
 * Clear all local data on logout
 */
export async function clearLocalData(): Promise<void> {
  // Clear localStorage
  if (typeof window !== "undefined") {
    localStorage.clear()
  }

  // Clear sessionStorage
  if (typeof window !== "undefined") {
    sessionStorage.clear()
  }

  // Clear IndexedDB databases
  await clearIndexedDB()
}

/**
 * Clear all IndexedDB databases
 */
async function clearIndexedDB(): Promise<void> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return
  }

  try {
    const databases = await window.indexedDB.databases()

    await Promise.all(
      databases.map((db) => {
        if (db.name) {
          return new Promise<void>((resolve, reject) => {
            const request = window.indexedDB.deleteDatabase(db.name!)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
            request.onblocked = () => resolve() // Continue even if blocked
          })
        }
        return Promise.resolve()
      })
    )
  } catch {
    // indexedDB.databases() might not be supported in all browsers
    console.warn("Could not clear IndexedDB databases")
  }
}
