import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "WebSocket endpoint placeholder. This will be replaced with actual WebSocket handling in production.",
  })
}
