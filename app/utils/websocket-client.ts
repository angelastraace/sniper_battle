// frontend/app/utils/websocket-client.ts

let socket: WebSocket | null = null

/**
 * Connects to the WebSocket stats server.
 */
export function connectWebSocket(
  onMessage: (data: any) => void,
  url = "ws://localhost:3002", // ⚡ change this to your production server later
) {
  if (socket) {
    socket.close()
  }

  socket = new WebSocket(url)

  socket.onopen = () => {
    console.log("✅ WebSocket connection opened")
  }

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    onMessage(data)
  }

  socket.onerror = (error) => {
    console.error("🔥 WebSocket error:", error)
  }

  socket.onclose = () => {
    console.log("❌ WebSocket connection closed, retrying...")
    setTimeout(() => connectWebSocket(onMessage, url), 5000) // auto-reconnect
  }
}

/**
 * Close the WebSocket connection.
 */
export function disconnectWebSocket() {
  if (socket) {
    socket.close()
    socket = null
  }
}
