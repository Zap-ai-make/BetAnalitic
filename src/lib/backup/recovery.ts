/**
 * Epic 12 Story 12.7: IndexedDB Backup & Recovery
 * Utilities for backing up and restoring offline data
 */

import Dexie from "dexie"
import { offlineDb, clearAllOfflineData } from "~/lib/db/offline"

export interface BackupData {
  version: number
  timestamp: number
  data: {
    user: unknown[]
    conversations: unknown[]
    analyses: unknown[]
    rooms: unknown[]
  }
}

class BackupManager {
  private backupDbName = "BetAnalyticBackupDB"

  /**
   * Create a backup of all offline data
   */
  async createBackup(): Promise<string> {
    try {
      const backup: BackupData = {
        version: 1,
        timestamp: Date.now(),
        data: {
          user: await offlineDb.user.toArray(),
          conversations: await offlineDb.conversations.toArray(),
          analyses: await offlineDb.analyses.toArray(),
          rooms: await offlineDb.rooms.toArray(),
        },
      }

      // Store backup in separate database
      const backupDb = new Dexie(this.backupDbName)
      backupDb.version(1).stores({
        backups: "++id, timestamp",
      })

      interface BackupRecord {
        id?: number
        timestamp: number
        data: BackupData
      }

      const backups = backupDb.table<BackupRecord>("backups")
      const id = await backups.add({
        timestamp: backup.timestamp,
        data: backup,
      })

      backupDb.close()

      return `backup-${String(id)}`
    } catch (error) {
      console.error("Error creating backup:", error)
      throw new Error("Failed to create backup")
    }
  }

  /**
   * List all available backups
   */
  async listBackups(): Promise<Array<{ id: string; timestamp: number }>> {
    try {
      const backupDb = new Dexie(this.backupDbName)
      backupDb.version(1).stores({
        backups: "++id, timestamp",
      })

      interface BackupRecord {
        id?: number
        timestamp: number
        data: BackupData
      }

      const backups = backupDb.table<BackupRecord>("backups")
      const allBackups = await backups.toArray()

      backupDb.close()

      return allBackups.map((b) => ({
        id: `backup-${b.id}`,
        timestamp: b.timestamp,
      }))
    } catch (error) {
      console.error("Error listing backups:", error)
      return []
    }
  }

  /**
   * Restore from a backup
   */
  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const id = parseInt(backupId.replace("backup-", ""))

      const backupDb = new Dexie(this.backupDbName)
      backupDb.version(1).stores({
        backups: "++id, timestamp",
      })

      interface BackupRecord {
        id?: number
        timestamp: number
        data: BackupData
      }

      const backups = backupDb.table<BackupRecord>("backups")
      const backup = await backups.get(id)

      if (!backup) {
        backupDb.close()
        throw new Error("Backup not found")
      }

      // Clear existing data
      await clearAllOfflineData()

      // Restore data
      const data = backup.data.data

      if (data.user.length > 0) {
        await offlineDb.user.bulkAdd(data.user as never[])
      }
      if (data.conversations.length > 0) {
        await offlineDb.conversations.bulkAdd(data.conversations as never[])
      }
      if (data.analyses.length > 0) {
        await offlineDb.analyses.bulkAdd(data.analyses as never[])
      }
      if (data.rooms.length > 0) {
        await offlineDb.rooms.bulkAdd(data.rooms as never[])
      }

      backupDb.close()

      return true
    } catch (error) {
      console.error("Error restoring backup:", error)
      return false
    }
  }

  /**
   * Export backup to JSON file
   */
  async exportBackup(backupId: string): Promise<string | null> {
    try {
      const id = parseInt(backupId.replace("backup-", ""))

      const backupDb = new Dexie(this.backupDbName)
      backupDb.version(1).stores({
        backups: "++id, timestamp",
      })

      interface BackupRecord {
        id?: number
        timestamp: number
        data: BackupData
      }

      const backups = backupDb.table<BackupRecord>("backups")
      const backup = await backups.get(id)

      backupDb.close()

      if (!backup) {
        return null
      }

      return JSON.stringify(backup.data, null, 2)
    } catch (error) {
      console.error("Error exporting backup:", error)
      return null
    }
  }

  /**
   * Delete old backups, keep only the last N
   */
  async pruneBackups(keepLast = 5): Promise<number> {
    try {
      const backupDb = new Dexie(this.backupDbName)
      backupDb.version(1).stores({
        backups: "++id, timestamp",
      })

      interface BackupRecord {
        id?: number
        timestamp: number
        data: BackupData
      }

      const backups = backupDb.table<BackupRecord>("backups")
      const allBackups = await backups.orderBy("timestamp").reverse().toArray()

      if (allBackups.length <= keepLast) {
        backupDb.close()
        return 0
      }

      const toDelete = allBackups.slice(keepLast)
      const deleteIds = toDelete.map((b) => b.id!).filter((id) => id !== undefined)

      await backups.bulkDelete(deleteIds)

      backupDb.close()

      return deleteIds.length
    } catch (error) {
      console.error("Error pruning backups:", error)
      return 0
    }
  }
}

// Export singleton instance
export const backupManager = new BackupManager()
