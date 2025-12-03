"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface Passenger {
  id: number
  name: string
  tc_no: string
  email: string
  phone: string
  gender: string
  age: number
  reservations: number
}

interface Flight {
  id: number
  code: string
  from_city: string
  to_city: string
  date: string
  time: string
}

interface Reservation {
  id: number
  passenger_name: string
  flight_code: string
  seat: number
  flight_date: string
  flight_time: string
  from_city: string
  to_city: string
  status: string
}

export function PassengersMenu() {
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [flights, setFlights] = useState<Flight[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    tc_no: '',
    email: '',
    phone: '',
    gender: 'Erkek',
    age: ''
  })

  const [reservationData, setReservationData] = useState({
    yolcu_id: '',
    ucus_id: '',
    seat: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [passengersData, flightsData, reservationsData] = await Promise.all([
        api.getPassengers(),
        api.getFlights(),
        api.getReservations()
      ])
      setPassengers(passengersData)
      setFlights(flightsData)
      setReservations(reservationsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPassenger = async () => {
    try {
      await api.addPassenger({
        name: formData.name,
        tc_no: formData.tc_no,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        age: parseInt(formData.age)
      })
      setFormData({ name: '', tc_no: '', email: '', phone: '', gender: 'Erkek', age: '' })
      loadData()
      alert('Yolcu başarıyla eklendi!')
    } catch (error) {
      console.error('Error adding passenger:', error)
      alert('Yolcu eklenirken hata oluştu!')
    }
  }

  const handleUpdatePassenger = async () => {
    if (!editingPassenger) return
    try {
      await api.updatePassenger(editingPassenger.id, {
        name: formData.name,
        tc_no: formData.tc_no,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        age: parseInt(formData.age)
      })
      setEditingPassenger(null)
      setFormData({ name: '', tc_no: '', email: '', phone: '', gender: 'Erkek', age: '' })
      loadData()
      alert('Yolcu bilgileri başarıyla güncellendi!')
    } catch (error) {
      console.error('Error updating passenger:', error)
      alert('Yolcu güncellenirken hata oluştu!')
    }
  }

  const handleDeletePassenger = async (id: number) => {
    if (!confirm('Bu yolcuyu silmek istediğinizden emin misiniz?')) return
    try {
      await api.deletePassenger(id)
      loadData()
      alert('Yolcu başarıyla silindi!')
    } catch (error) {
      console.error('Error deleting passenger:', error)
      alert('Yolcu silinirken hata oluştu!')
    }
  }

  const handleMakeReservation = async () => {
    try {
      await api.addTicket({
        yolcu_id: parseInt(reservationData.yolcu_id),
        ucus_id: parseInt(reservationData.ucus_id),
        seat: parseInt(reservationData.seat),
        price: 1000
      })
      setReservationData({ yolcu_id: '', ucus_id: '', seat: '' })
      loadData()
      alert('Rezervasyon başarıyla oluşturuldu!')
    } catch (error) {
      console.error('Error making reservation:', error)
      alert('Rezervasyon oluşturulurken hata oluştu!')
    }
  }

  const handleCancelReservation = async (id: number) => {
    if (!confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) return
    try {
      await api.deleteTicket(id)
      loadData()
      alert('Rezervasyon başarıyla iptal edildi!')
    } catch (error) {
      console.error('Error canceling reservation:', error)
      alert('Rezervasyon iptal edilirken hata oluştu!')
    }
  }

  const startEdit = (passenger: Passenger) => {
    setEditingPassenger(passenger)
    setFormData({
      name: passenger.name,
      tc_no: passenger.tc_no,
      email: passenger.email,
      phone: passenger.phone,
      gender: passenger.gender,
      age: passenger.age.toString()
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
          <h1 className="text-3xl font-bold text-foreground">Yolcular</h1>
          <p className="text-muted-foreground">Yolcuları ve rezervasyonlarını yönetin</p>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Yolcuları Listele</TabsTrigger>
          <TabsTrigger value="add">Yolcu Ekle</TabsTrigger>
          <TabsTrigger value="reservation">Rezervasyon Yap</TabsTrigger>
          <TabsTrigger value="cancel">Rezervasyon İptal</TabsTrigger>
          <TabsTrigger value="update">Yolcu Güncelle</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Adı Soyadı</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">TC No</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Telefon</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Cinsiyet</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Yaş</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Rezervasyon</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.map((passenger) => (
                    <tr key={passenger.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{passenger.name}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{passenger.tc_no}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{passenger.email}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{passenger.phone}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{passenger.gender}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{passenger.age}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{passenger.reservations}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(passenger)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeletePassenger(passenger.id)}>
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
            <h2 className="text-lg font-semibold text-foreground mb-4">Yeni Yolcu Ekle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Adı Soyadı</label>
                <input
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">TC Kimlik No</label>
                <input
                  type="text"
                  placeholder="12345678901"
                  value={formData.tc_no}
                  onChange={(e) => setFormData({...formData, tc_no: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  placeholder="ahmet@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Telefon</label>
                <input
                  type="tel"
                  placeholder="5551234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cinsiyet</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                >
                  <option value="Erkek">Erkek</option>
                  <option value="Kadın">Kadın</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Yaş</label>
                <input
                  type="number"
                  placeholder="30"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
            </div>
            <Button className="mt-6" onClick={handleAddPassenger}>Yolcu Oluştur</Button>
          </Card>
        </TabsContent>

        <TabsContent value="reservation" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Yeni Rezervasyon Yap</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Yolcu Seçin</label>
                <select 
                  value={reservationData.yolcu_id}
                  onChange={(e) => setReservationData({...reservationData, yolcu_id: e.target.value})}
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
                  value={reservationData.ucus_id}
                  onChange={(e) => setReservationData({...reservationData, ucus_id: e.target.value})}
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
                  value={reservationData.seat}
                  onChange={(e) => setReservationData({...reservationData, seat: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
            </div>
            <Button className="mt-6" onClick={handleMakeReservation}>Rezervasyon Oluştur</Button>
          </Card>
        </TabsContent>

        <TabsContent value="cancel" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Rezervasyon İptal Et</h2>
            <p className="text-muted-foreground mb-4">İptal etmek istediğiniz rezervasyonu seçin</p>
            <div className="space-y-2">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold text-foreground">{reservation.passenger_name} - {reservation.flight_code}</p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.from_city} → {reservation.to_city} | {reservation.flight_date} {reservation.flight_time} - Koltuk: {reservation.seat}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reservation.status === 'Ödendi' 
                        ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                        : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {reservation.status}
                    </span>
                    <Button variant="outline" className="text-destructive bg-transparent" onClick={() => handleCancelReservation(reservation.id)}>
                      İptal Et
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="update" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Yolcu Bilgilerini Güncelle</h2>
            {editingPassenger ? (
              <>
                <p className="text-muted-foreground mb-4">Düzenlenen: {editingPassenger.name}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Adı Soyadı</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">TC Kimlik No</label>
                    <input
                      type="text"
                      value={formData.tc_no}
                      onChange={(e) => setFormData({...formData, tc_no: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Cinsiyet</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    >
                      <option value="Erkek">Erkek</option>
                      <option value="Kadın">Kadın</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Yaş</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleUpdatePassenger}>Güncelle</Button>
                  <Button variant="outline" onClick={() => {
                    setEditingPassenger(null)
                    setFormData({ name: '', tc_no: '', email: '', phone: '', gender: 'Erkek', age: '' })
                  }}>İptal</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">Güncellemek istediğiniz yolcuyu seçin</p>
                <div className="space-y-4">
                  {passengers.map((passenger) => (
                    <div
                      key={passenger.id}
                      className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{passenger.name}</p>
                        <p className="text-sm text-muted-foreground">{passenger.email}</p>
                      </div>
                      <Button variant="outline" onClick={() => startEdit(passenger)}>Güncelle</Button>
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
