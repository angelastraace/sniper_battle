import type { Metadata } from "next"
import RadarSystemPage from "./radar-system-page"

export const metadata: Metadata = {
  title: "Radar System | Ace Sniper Battle Station",
  description: "Advanced radar system for blockchain monitoring",
}

export default function RadarPage() {
  return <RadarSystemPage />
}
