import type { Metadata } from "next"
import CommandCenterPage from "../command-center/command-center-page"

export const metadata: Metadata = {
  title: "Battle Control Center | Advanced Blockchain Scanner",
  description: "Command and control center for blockchain operations",
}

export default function ControlCenterPage() {
  return <CommandCenterPage />
}
