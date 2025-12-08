"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Sidebar } from "@/components/sidebar"
import { FlightsMenu } from "@/components/flights-menu"
import { PassengersMenu } from "@/components/passengers-menu"
import { AircraftMenu } from "@/components/aircraft-menu"
import { TicketsMenu } from "@/components/tickets-menu"
import { DashboardOverview } from "@/components/dashboard-overview"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [activeMenu, setActiveMenu] = useState<"overview" | "flights" | "passengers" | "aircraft" | "tickets">(
    "overview",
  )

  useEffect(() => {
    const savedUsername = localStorage.getItem("username")
    const savedToken = localStorage.getItem("authToken")
    if (savedUsername && savedToken) {
      setUsername(savedUsername)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLoginSuccess = (token: string, user: string) => {
    localStorage.setItem("authToken", token)
    localStorage.setItem("username", user)
    setUsername(user)
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      await api.logout()
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      localStorage.removeItem("authToken")
      localStorage.removeItem("username")
      setIsAuthenticated(false)
      setUsername("")
      setActiveMenu("overview")
    }
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="text-sm text-muted-foreground">
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Çıkış Yap
          </Button>
        </div>

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
