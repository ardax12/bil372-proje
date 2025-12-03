"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { FlightsMenu } from "@/components/flights-menu"
import { PassengersMenu } from "@/components/passengers-menu"
import { AircraftMenu } from "@/components/aircraft-menu"
import { TicketsMenu } from "@/components/tickets-menu"
import { DashboardOverview } from "@/components/dashboard-overview"

export default function Home() {
  const [activeMenu, setActiveMenu] = useState<"overview" | "flights" | "passengers" | "aircraft" | "tickets">(
    "overview",
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeMenu === "overview" && <DashboardOverview />}
          {activeMenu === "flights" && <FlightsMenu />}
          {activeMenu === "passengers" && <PassengersMenu />}
          {activeMenu === "aircraft" && <AircraftMenu />}
          {activeMenu === "tickets" && <TicketsMenu />}
        </div>
      </main>
    </div>
  )
}
