// Blockchain monitor service

export function addSystemLog(level: "INFO" | "WARNING" | "ERROR", message: string): void {
  console.log(`[${level}] ${message}`)

  // In a real implementation, this would send the log to a backend service
  // or store it in a database
  try {
    fetch("/api/system/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level,
        message,
        timestamp: Date.now(),
      }),
    }).catch((err) => console.error("Failed to send log to server:", err))
  } catch (error) {
    console.error("Error logging system message:", error)
  }
}
