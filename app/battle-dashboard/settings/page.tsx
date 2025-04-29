import type { Metadata } from "next"
import SettingsPage from "./settings-page"

export const metadata: Metadata = {
  title: "Settings | Ace Sniper Battle Station",
  description: "Configure your Ace Sniper Battle Station",
}

export default function Settings() {
  return <SettingsPage />
}
