// Backend status utility functions

/**
 * Check if the backend service is available
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch("/api/status/health", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    return response.ok
  } catch (error) {
    console.error("Error checking backend availability:", error)
    return false
  }
}

/**
 * Get detailed backend status information
 */
export async function getBackendStatus(): Promise<any> {
  try {
    const response = await fetch("/api/status/details", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch backend status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching backend status:", error)
    throw error
  }
}
