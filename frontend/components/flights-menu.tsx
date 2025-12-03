"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface Flight {
  id: number
  code: string
  from_city: string
  to_city: string
  from_code: string
  to_code: string
  date: string
  time: string
  duration: string
  ucak_id: number
  pilot_id: number
  kalkis_id: number
  varis_id: number
  aircraft_model: string
  pilot_name: string
}

interface Airport {
  id: number
  name: string
  city: string
  code: string
}

interface Pilot {
  id: number
  name: string
  role: string
}

interface Aircraft {
  id: number
  model: string
  code: string
  capacity: number
}

export function FlightsMenu() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null)
  
  const [formData, setFormData] = useState({
    code: '',
    kalkis_id: '',
    varis_id: '',
    ucak_id: '',
    pilot_id: '',
    date: '',
    time: '',
    duration: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [flightsData, airportsData, pilotsData, aircraftData] = await Promise.all([
        api.getFlights(),
        api.getAirports(),
        api.getPilots(),
        api.getAircraft()
      ])
      setFlights(flightsData)
      setAirports(airportsData)
      setPilots(pilotsData)
      setAircraft(aircraftData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFlight = async () => {
    try {
      await api.addFlight({
        code: formData.code,
        kalkis_id: parseInt(formData.kalkis_id),
        varis_id: parseInt(formData.varis_id),
        ucak_id: parseInt(formData.ucak_id),
        pilot_id: parseInt(formData.pilot_id),
        date: formData.date,
        time: formData.time,
        duration: formData.duration
      })
      setFormData({ code: '', kalkis_id: '', varis_id: '', ucak_id: '', pilot_id: '', date: '', time: '', duration: '' })
      loadData()
      alert('Uçuş başarıyla eklendi!')
    } catch (error) {
      console.error('Error adding flight:', error)
      alert('Uçuş eklenirken hata oluştu!')
    }
  }

  const handleUpdateFlight = async () => {
    if (!editingFlight) return
    try {
      await api.updateFlight(editingFlight.id, {
        code: formData.code,
        kalkis_id: parseInt(formData.kalkis_id),
        varis_id: parseInt(formData.varis_id),
        ucak_id: parseInt(formData.ucak_id),
        pilot_id: parseInt(formData.pilot_id),
        date: formData.date,
        time: formData.time,
        duration: formData.duration
      })
      setEditingFlight(null)
      setFormData({ code: '', kalkis_id: '', varis_id: '', ucak_id: '', pilot_id: '', date: '', time: '', duration: '' })
      loadData()
      alert('Uçuş başarıyla güncellendi!')
    } catch (error) {
      console.error('Error updating flight:', error)
      alert('Uçuş güncellenirken hata oluştu!')
    }
  }

  const handleDeleteFlight = async (id: number) => {
    if (!confirm('Bu uçuşu silmek istediğinizden emin misiniz?')) return
    try {
      await api.deleteFlight(id)
      loadData()
      alert('Uçuş başarıyla silindi!')
    } catch (error) {
      console.error('Error deleting flight:', error)
      alert('Uçuş silinirken hata oluştu!')
    }
  }

  const startEdit = (flight: Flight) => {
    setEditingFlight(flight)
    setFormData({
      code: flight.code,
      kalkis_id: flight.kalkis_id?.toString() || '',
      varis_id: flight.varis_id?.toString() || '',
      ucak_id: flight.ucak_id?.toString() || '',
      pilot_id: flight.pilot_id?.toString() || '',
      date: flight.date,
      time: flight.time,
      duration: flight.duration || ''
    })
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
          <h1 className="text-3xl font-bold text-foreground">Uçuşlar</h1>
          <p className="text-muted-foreground">Tüm uçuşları yönetin ve kontrol edin</p>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Uçuşları Listele</TabsTrigger>
          <TabsTrigger value="add">Uçuş Ekle</TabsTrigger>
          <TabsTrigger value="update">Güncelle</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Uçuş Kodu</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Kalkış</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Varış</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tarih</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Saat</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Uçak</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Pilot</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map((flight) => (
                    <tr key={flight.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{flight.code}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{flight.from_city} ({flight.from_code})</td>
                      <td className="px-6 py-4 text-sm text-foreground">{flight.to_city} ({flight.to_code})</td>
                      <td className="px-6 py-4 text-sm text-foreground">{flight.date}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{flight.time}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{flight.aircraft_model}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{flight.pilot_name}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(flight)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteFlight(flight.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Yeni Uçuş Ekle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Uçuş Kodu</label>
                <input
                  type="text"
                  placeholder="TK101"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Kalkış Havaalanı</label>
                <select 
                  value={formData.kalkis_id}
                  onChange={(e) => setFormData({...formData, kalkis_id: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                >
                  <option value="">Seçiniz</option>
                  {airports.map(a => (
                    <option key={a.id} value={a.id}>{a.city} - {a.name} ({a.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Varış Havaalanı</label>
                <select 
                  value={formData.varis_id}
                  onChange={(e) => setFormData({...formData, varis_id: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                >
                  <option value="">Seçiniz</option>
                  {airports.map(a => (
                    <option key={a.id} value={a.id}>{a.city} - {a.name} ({a.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Uçak</label>
                <select 
                  value={formData.ucak_id}
                  onChange={(e) => setFormData({...formData, ucak_id: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                >
                  <option value="">Seçiniz</option>
                  {aircraft.map(a => (
                    <option key={a.id} value={a.id}>{a.model} ({a.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pilot</label>
                <select 
                  value={formData.pilot_id}
                  onChange={(e) => setFormData({...formData, pilot_id: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                >
                  <option value="">Seçiniz</option>
                  {pilots.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tarih</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Kalkış Saati</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Uçuş Süresi</label>
                <input
                  type="time"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
            </div>
            <Button className="mt-6" onClick={handleAddFlight}>Uçuş Oluştur</Button>
          </Card>
        </TabsContent>

        <TabsContent value="update" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Uçuş Bilgilerini Güncelle</h2>
            {editingFlight ? (
              <>
                <p className="text-muted-foreground mb-4">Düzenlenen: {editingFlight.code}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Uçuş Kodu</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Kalkış Havaalanı</label>
                    <select 
                      value={formData.kalkis_id}
                      onChange={(e) => setFormData({...formData, kalkis_id: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    >
                      <option value="">Seçiniz</option>
                      {airports.map(a => (
                        <option key={a.id} value={a.id}>{a.city} - {a.name} ({a.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Varış Havaalanı</label>
                    <select 
                      value={formData.varis_id}
                      onChange={(e) => setFormData({...formData, varis_id: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    >
                      <option value="">Seçiniz</option>
                      {airports.map(a => (
                        <option key={a.id} value={a.id}>{a.city} - {a.name} ({a.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Uçak</label>
                    <select 
                      value={formData.ucak_id}
                      onChange={(e) => setFormData({...formData, ucak_id: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    >
                      <option value="">Seçiniz</option>
                      {aircraft.map(a => (
                        <option key={a.id} value={a.id}>{a.model} ({a.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Pilot</label>
                    <select 
                      value={formData.pilot_id}
                      onChange={(e) => setFormData({...formData, pilot_id: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    >
                      <option value="">Seçiniz</option>
                      {pilots.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {p.role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tarih</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Kalkış Saati</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Uçuş Süresi</label>
                    <input
                      type="time"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleUpdateFlight}>Güncelle</Button>
                  <Button variant="outline" onClick={() => {
                    setEditingFlight(null)
                    setFormData({ code: '', kalkis_id: '', varis_id: '', ucak_id: '', pilot_id: '', date: '', time: '', duration: '' })
                  }}>İptal</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">Güncellemek istediğiniz uçuşu seçin</p>
                <div className="space-y-4">
                  {flights.map((flight) => (
                    <div
                      key={flight.id}
                      className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{flight.code}</p>
                        <p className="text-sm text-muted-foreground">
                          {flight.from_city} → {flight.to_city}
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => startEdit(flight)}>Güncelle</Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
