"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Clock, Activity, Zap, Shield, Target } from "lucide-react"

interface BattleStats {
  activeScans: number
  completedScans: number
  successRate: number
  totalHits: number
  totalValue: number
  uptime: string
}

interface BattleSystem {
  id: string
  name: string
  status: "online" | "offline" | "warning"
  lastUpdated: string
  type: "scanner" | "sweeper" | "analyzer" | "monitor"
}

export default function BattleManagerDashboard() {
  const [stats, setStats] = useState<BattleStats>({
    activeScans: 3,
    completedScans: 1254,
    successRate: 2.7,
    totalHits: 34,
    totalValue: 12.85,
    uptime: "6d 12h 34m",
  })

  const [systems, setSystems] = useState<BattleSystem[]>([
    {
      id: "1",
      name: "Ethereum Scanner",
      status: "online",
      lastUpdated: "2 minutes ago",
      type: "scanner",
    },
    {
      id: "2",
      name: "Solana Sweeper",
      status: "online",
      lastUpdated: "1 minute ago",
      type: "sweeper",
    },
    {
      id: "3",
      name: "Wordlist Analyzer",
      status: "warning",
      lastUpdated: "15 minutes ago",
      type: "analyzer",
    },
    {
      id: "4",
      name: "BSC Monitor",
      status: "offline",
      lastUpdated: "3 hours ago",
      type: "monitor",
    },
  ])

  // Simulate updating stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        activeScans: Math.floor(Math.random() * 5) + 1,
        completedScans: prev.completedScans + Math.floor(Math.random() * 10),
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "offline":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "scanner":
        return <Target className="h-4 w-4" />
      case "sweeper":
        return <Zap className="h-4 w-4" />
      case "analyzer":
        return <Activity className="h-4 w-4" />
      case "monitor":
        return <Shield className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Battle Manager Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Scans</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeScans}</div>
            <p className="text-xs text-muted-foreground">Scanning in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Scans</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedScans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 100)} in the last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">{stats.totalHits} total hits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all chains</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="systems" className="space-y-4">
        <TabsList>
          <TabsTrigger value="systems">Systems</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Battle Systems Status</CardTitle>
              <CardDescription>Monitor and manage all battle systems from a central location.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {systems.map((system) => (
                <div key={system.id} className="flex items-center justify-between p-2 border-b">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(system.type)}
                    <span>{system.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">Updated {system.lastUpdated}</span>
                    <Badge
                      variant={
                        system.status === "online" ? "default" : system.status === "warning" ? "outline" : "destructive"
                      }
                      className="flex items-center space-x-1"
                    >
                      {getStatusIcon(system.status)}
                      <span>{system.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Refresh All Systems
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Operations</CardTitle>
              <CardDescription>Currently running battle operations.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>No active operations at this time.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Launch New Operation
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent activity and system logs.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">[INFO] System uptime: {stats.uptime}</p>
              <p className="text-sm text-muted-foreground">[INFO] Last scan completed successfully</p>
              <p className="text-sm text-muted-foreground">[WARN] BSC Monitor connection unstable</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
