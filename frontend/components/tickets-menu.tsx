"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, CheckCircle, CreditCard, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface Ticket {
  id: number
  ucus_id: number
  yolcu_id: number
  seat: number
  price: number
  purchase_date: string
  passenger_name: string
  flight_code: string
  status: string
}

interface Passenger {
  id: number
  name: string
}

interface Flight {
  id: number
  code: string
  from_city: string
  to_city: string
  date: string
}

interface Stats {
  totalRevenue: number
  paidTickets: number
  refundedTickets: number
}

export function TicketsMenu() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [flights, setFlights] = useState<Flight[]>([])
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, paidTickets: 0, refundedTickets: 0 })
  const [loading, setLoading] = useState(true)

  const [purchaseData, setPurchaseData] = useState({
    yolcu_id: '',
    ucus_id: '',
    seat: '',
    price: '',
    method: 'Kredi Kartı'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ticketsData, passengersData, flightsData, statsData] = await Promise.all([
        api.getTickets(),
        api.getPassengers(),
        api.getFlights(),
        api.getStats()
      ])
      setTickets(ticketsData)
      setPassengers(passengersData)
      setFlights(flightsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseTicket = async () => {
    try {
      // First create the ticket
      const ticketResult = await api.addTicket({
        yolcu_id: parseInt(purchaseData.yolcu_id),
        ucus_id: parseInt(purchaseData.ucus_id),
        seat: parseInt(purchaseData.seat),
        price: parseInt(purchaseData.price)
      })
      
      // Then create the payment
      await api.addPayment({
        bilet_id: ticketResult.id,
        method: purchaseData.method
      })
      
      setPurchaseData({ yolcu_id: '', ucus_id: '', seat: '', price: '', method: 'Kredi Kartı' })
      loadData()
      alert('Bilet başarıyla satın alındı!')
    } catch (error) {
      console.error('Error purchasing ticket:', error)
      alert('Bilet satın alınırken hata oluştu!')
    }
  }

  const handlePayTicket = async (ticketId: number) => {
    try {
      await api.addPayment({
        bilet_id: ticketId,
        method: 'Kredi Kartı'
      })
      loadData()
      alert('Ödeme başarıyla alındı!')
    } catch (error) {
      console.error('Error paying ticket:', error)
      alert('Ödeme işlemi sırasında hata oluştu!')
    }
  }

  const handleRefundTicket = async (ticketId: number) => {
    if (!confirm('Bu bileti iade etmek istediğinizden emin misiniz?')) return
    try {
      await api.deleteTicket(ticketId)
      loadData()
      alert('Bilet başarıyla iade edildi!')
    } catch (error) {
      console.error('Error refunding ticket:', error)
      alert('Bilet iade edilirken hata oluştu!')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ödendi":
        return "bg-green-500/20 text-green-700 dark:text-green-400"
      case "Beklemede":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
      case "İade Edildi":
        return "bg-red-500/20 text-red-700 dark:text-red-400"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Biletler & Ödemeler</h1>
          <p className="text-muted-foreground">Biletleri ve ödeme işlemlerini yönetin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Toplam Satış</p>
              <p className="text-3xl font-bold text-primary">₺{stats.totalRevenue?.toLocaleString()}</p>
            </div>
            <CreditCard className="w-12 h-12 text-muted-foreground/20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Ödenen Biletler</p>
              <p className="text-3xl font-bold text-primary">{stats.paidTickets}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-muted-foreground/20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Toplam Bilet</p>
              <p className="text-3xl font-bold text-primary">{tickets.length}</p>
            </div>
            <Plus className="w-12 h-12 text-muted-foreground/20" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Biletleri Listele</TabsTrigger>
          <TabsTrigger value="purchase">Bilet Satın Al</TabsTrigger>
          <TabsTrigger value="payment">Ödeme İşlemleri</TabsTrigger>
          <TabsTrigger value="refund">Bilet İade Et</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Bilet ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Yolcu</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Uçuş</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Koltuk</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fiyat</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tarih</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">#{ticket.id}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{ticket.passenger_name}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{ticket.flight_code}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{ticket.seat}</td>
                      <td className="px-6 py-4 text-sm text-foreground">₺{ticket.price}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{ticket.purchase_date}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="purchase" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Bilet Satın Al</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Yolcu Seçin</label>
                <select 
                  value={purchaseData.yolcu_id}
                  onChange={(e) => setPurchaseData({...purchaseData, yolcu_id: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                >
                  <option value="">Seçiniz</option>
                  {passengers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Uçuş Seçin</label>
                <select 
                  value={purchaseData.ucus_id}
                  onChange={(e) => setPurchaseData({...purchaseData, ucus_id: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                >
                  <option value="">Seçiniz</option>
                  {flights.map(f => (
                    <option key={f.id} value={f.id}>{f.code} - {f.from_city} → {f.to_city} ({f.date})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Koltuk Numarası</label>
                <input
                  type="number"
                  placeholder="12"
                  value={purchaseData.seat}
                  onChange={(e) => setPurchaseData({...purchaseData, seat: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fiyat (₺)</label>
                <input
                  type="number"
                  placeholder="1500"
                  value={purchaseData.price}
                  onChange={(e) => setPurchaseData({...purchaseData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Ödeme Yöntemi</label>
                <select 
                  value={purchaseData.method}
                  onChange={(e) => setPurchaseData({...purchaseData, method: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                >
                  <option value="Kredi Kartı">Kredi Kartı</option>
                  <option value="Nakit">Nakit</option>
                  <option value="Banka Transferi">Banka Transferi</option>
                </select>
              </div>
            </div>
            <Button className="mt-6" onClick={handlePurchaseTicket}>Bilet Satın Al</Button>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Ödeme İşlemleri</h2>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        #{ticket.id} - {ticket.passenger_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{ticket.flight_code}</p>
                    </div>
                    <p className="font-bold text-primary">₺{ticket.price}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    {ticket.status === "Beklemede" && (
                      <Button size="sm" onClick={() => handlePayTicket(ticket.id)}>Ödeme Yap</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="refund" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Bilet İade Et</h2>
            <div className="space-y-3">
              {tickets.filter(t => t.status === "Ödendi").map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      #{ticket.id} - {ticket.passenger_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.flight_code} - ₺{ticket.price}
                    </p>
                  </div>
                  <Button variant="outline" className="text-destructive bg-transparent" onClick={() => handleRefundTicket(ticket.id)}>
                    İade Et
                  </Button>
                </div>
              ))}
              {tickets.filter(t => t.status === "Ödendi").length === 0 && (
                <p className="text-muted-foreground text-center py-8">İade edilebilecek bilet bulunmuyor.</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
