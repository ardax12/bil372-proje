"use client"

import { Plane, Users, Wifi, Ticket, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeMenu: string
  setActiveMenu: (menu: any) => void
}

export function Sidebar({ activeMenu, setActiveMenu }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Genel Bakış", icon: BarChart3 },
    { id: "flights", label: "Uçuşlar", icon: Plane },
    { id: "passengers", label: "Yolcular", icon: Users },
    { id: "aircraft", label: "Uçaklar", icon: Plane },
    { id: "tickets", label: "Biletler & Ödemeler", icon: Ticket },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            ✈
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">AirCrew</h1>
        </div>
        <p className="text-sm text-sidebar-foreground/60">Uçuş Yönetim Sistemi</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeMenu === item.id
          return (
            <Button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start gap-3 text-white"
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Button>
          )
        })}
      </nav>

      <div className="pt-6 border-t border-sidebar-border">
      </div>
    </aside>
  )
}
