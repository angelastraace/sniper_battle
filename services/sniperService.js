let socket
let targets = []
let subscribers = []
let isConnecting = false
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10
const RECONNECT_INTERVAL = 3000 // 3 seconds

// Update + notify all subscribers
const updateTargets = (newTargets) => {
  targets = newTargets
  subscribers.forEach((callback) => callback(targets))
}

// Subscribe to target updates
const subscribeToTargets = (callback) => {
  subscribers.push(callback)
  callback(targets) // Send current data immediately if available

  // Return unsubscribe function
  return () => {
    subscribers = subscribers.filter((sub) => sub !== callback)
  }
}

// === WEBSOCKET SETUP ===
const connectWebSocket = () => {
  socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL)

  socket.onopen = () => {
    console.log("🟢 Connected to sniper WebSocket server")
    isConnecting = false
    reconnectAttempts = 0
  }

  socket.onmessage = (event) => {
    try {
      const newTargets = JSON.parse(event.data)
      updateTargets(newTargets)
    } catch (error) {
      console.error("❌ Failed to parse WebSocket message", error)
    }
  }

  socket.onerror = (error) => {
    console.error("🔴 WebSocket error:", error.message)
    isConnecting = false

    // Attempt to reconnect
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++
      console.log(`Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${RECONNECT_INTERVAL}ms`)
      setTimeout(connectWebSocket, RECONNECT_INTERVAL)
    } else {
      console.error("Maximum reconnection attempts reached. WebSocket connection failed.")
    }
  }

  socket.onclose = (event) => {
    console.warn("🔌 WebSocket closed. Attempting to reconnect in 5s...")
    isConnecting = false

    // Attempt to reconnect
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++
      console.log(`Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${RECONNECT_INTERVAL}ms`)
      setTimeout(connectWebSocket, RECONNECT_INTERVAL)
    }
  }
}

// Initialize WebSocket when in browser environment
if (typeof window !== "undefined") {
  // Wait for the DOM to be fully loaded
  if (document.readyState === "complete") {
    connectWebSocket()
  } else {
    window.addEventListener("load", connectWebSocket)
  }
}

// Stats subscribers
let statsSubscribers = []

const subscribeToStats = (callback) => {
  statsSubscribers.push(callback)

  // Return unsubscribe function
  return () => {
    statsSubscribers = statsSubscribers.filter((sub) => sub !== callback)
  }
}

// Real implementation of target management methods
const addTarget = async (address, network) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket connection not available")
  }

  socket.send(
    JSON.stringify({
      action: "addTarget",
      data: { address, network },
    }),
  )

  // Return a promise that resolves when we get a response
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Operation timed out"))
    }, 10000)

    const messageHandler = (event) => {
      try {
        const response = JSON.parse(event.data)
        if (response.type === "targetAdded" && response.address === address) {
          clearTimeout(timeout)
          socket.removeEventListener("message", messageHandler)
          resolve(response.target)
        }
      } catch (err) {
        // Ignore parsing errors for other messages
      }
    }

    socket.addEventListener("message", messageHandler)
  })
}

const removeTarget = async (id) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket connection not available")
  }

  socket.send(
    JSON.stringify({
      action: "removeTarget",
      data: { id },
    }),
  )

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Operation timed out"))
    }, 10000)

    const messageHandler = (event) => {
      try {
        const response = JSON.parse(event.data)
        if (response.type === "targetRemoved" && response.id === id) {
          clearTimeout(timeout)
          socket.removeEventListener("message", messageHandler)
          resolve(true)
        }
      } catch (err) {
        // Ignore parsing errors for other messages
      }
    }

    socket.addEventListener("message", messageHandler)
  })
}

const activateTarget = async (id) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket connection not available")
  }

  socket.send(
    JSON.stringify({
      action: "activateTarget",
      data: { id },
    }),
  )

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Operation timed out"))
    }, 10000)

    const messageHandler = (event) => {
      try {
        const response = JSON.parse(event.data)
        if (response.type === "targetActivated" && response.id === id) {
          clearTimeout(timeout)
          socket.removeEventListener("message", messageHandler)
          resolve(true)
        }
      } catch (err) {
        // Ignore parsing errors for other messages
      }
    }

    socket.addEventListener("message", messageHandler)
  })
}

const sweepTarget = async (id) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket connection not available")
  }

  socket.send(
    JSON.stringify({
      action: "sweepTarget",
      data: { id },
    }),
  )

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Operation timed out"))
    }, 30000) // Longer timeout for blockchain operations

    const messageHandler = (event) => {
      try {
        const response = JSON.parse(event.data)
        if (response.type === "targetSwept" && response.id === id) {
          clearTimeout(timeout)
          socket.removeEventListener("message", messageHandler)
          resolve(true)
        }
      } catch (err) {
        // Ignore parsing errors for other messages
      }
    }

    socket.addEventListener("message", messageHandler)
  })
}

// Start connection when imported
// connectWebSocket();

// Export sniperService API
const sniperService = {
  subscribeToTargets,
  subscribeToStats,
  addTarget,
  removeTarget,
  activateTarget,
  sweepTarget,
}

export default sniperService
