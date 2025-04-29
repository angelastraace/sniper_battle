import { NextResponse } from "next/server"

// Simple in-memory log storage
const systemLogs: Array<{
  level: string
  message: string
  timestamp: number
}> = []

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.level || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Add log to storage
    const logEntry = {
      level: body.level,
      message: body.message,
      timestamp: body.timestamp || Date.now(),
    }

    systemLogs.push(logEntry)

    // Keep only the last 100 logs
    if (systemLogs.length > 100) {
      systemLogs.shift()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging system message:", error)
    return NextResponse.json({ error: "Failed to log system message" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ logs: systemLogs })
}
