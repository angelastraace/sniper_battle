"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Server, Database, Cpu, RefreshCw, AlertCircle } from "lucide-react"
import { getBackendStatus, isBackendAvailable } from "../utils/backend-status"

export default function BackendStatus() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [available, setAvailable] = useState(false)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      // First check if backend is available
      const isAvailable = await isBackendAvailable()
      setAvailable(isAvailable)

      if (isAvailable) {
        const statusData = await getBackendStatus()
        setStatus(statusData)
      } else {
        setError("Backend service is not available")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch backend status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()

    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Server className="mr-2 h-5 w-5" />
          Backend Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Connection Status</span>
              <Badge variant={available ? "success" : "destructive"}>{available ? "Connected" : "Disconnected"}</Badge>
            </div>

            {status && (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <Server className="mr-2 h-4 w-4" /> Server
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-muted-foreground">Status</div>
                    <div>{status.server.status}</div>
                    <div className="text-muted-foreground">Version</div>
                    <div>{status.server.version}</div>
                    <div className="text-muted-foreground">Node.js</div>
                    <div>{status.server.nodeVersion}</div>
                    <div className="text-muted-foreground">Uptime</div>
                    <div>{status.server.uptime}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <Database className="mr-2 h-4 w-4" /> Database
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-muted-foreground">Connection</div>
                    <div>
                      <Badge variant={status.database.connected ? "success" : "destructive"}>
                        {status.database.connected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">Response Time</div>
                    <div>{status.database.responseTime}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <Cpu className="mr-2 h-4 w-4" /> System
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-muted-foreground">Platform</div>
                    <div>
                      {status.system.platform} ({status.system.arch})
                    </div>
                    <div className="text-muted-foreground">CPUs</div>
                    <div>{status.system.cpus}</div>
                    <div className="text-muted-foreground">Memory</div>
                    <div>
                      {status.system.freeMemory} / {status.system.totalMemory}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={fetchStatus} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </CardFooter>
    </Card>
  )
}
