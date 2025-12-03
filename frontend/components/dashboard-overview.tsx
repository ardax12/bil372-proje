"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Plane, Users, Ticket, DollarSign, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface Stats {
  totalFlights: number
  totalPassengers: number
  totalAircraft: number
  totalTickets: number
  totalRevenue: number
  paidTickets: number
}

export function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await api.getStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Havayolu yönetim sistemine hoş geldiniz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Toplam Uçuş</p>
              <p className="text-3xl font-bold text-primary">{stats?.totalFlights || 0}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Toplam Yolcu</p>
              <p className="text-3xl font-bold text-primary">{stats?.totalPassengers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Satılan Bilet</p>
              <p className="text-3xl font-bold text-primary">{stats?.totalTickets || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Toplam Gelir</p>
              <p className="text-3xl font-bold text-primary">₺{stats?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Sistem Özeti</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Toplam Uçak</span>
              <span className="font-semibold text-foreground">{stats?.totalAircraft || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Ödenen Biletler</span>
              <span className="font-semibold text-foreground">{stats?.paidTickets || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Bekleyen Ödemeler</span>
              <span className="font-semibold text-foreground">{(stats?.totalTickets || 0) - (stats?.paidTickets || 0)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
              <Plane className="w-6 h-6 text-primary mb-2" />
              <p className="font-semibold text-foreground">Uçuş Ekle</p>
              <p className="text-sm text-muted-foreground">Yeni uçuş oluştur</p>
            </button>
            <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
              <Users className="w-6 h-6 text-green-500 mb-2" />
              <p className="font-semibold text-foreground">Yolcu Ekle</p>
              <p className="text-sm text-muted-foreground">Yeni yolcu kaydet</p>
            </button>
            <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
              <Ticket className="w-6 h-6 text-blue-500 mb-2" />
              <p className="font-semibold text-foreground">Bilet Sat</p>
              <p className="text-sm text-muted-foreground">Bilet satışı yap</p>
            </button>
            <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
              <DollarSign className="w-6 h-6 text-yellow-500 mb-2" />
              <p className="font-semibold text-foreground">Ödemeler</p>
              <p className="text-sm text-muted-foreground">Ödeme işlemleri</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
