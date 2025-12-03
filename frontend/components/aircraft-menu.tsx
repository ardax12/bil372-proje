"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface Aircraft {
  id: number
  model: string
  code: string
  capacity: number
}

export function AircraftMenu() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null)
  
  const [formData, setFormData] = useState({
    model: '',
    code: '',
    capacity: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await api.getAircraft()
      setAircraft(data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAircraft = async () => {
    try {
      await api.addAircraft({
        model: formData.model,
        code: formData.code,
        capacity: parseInt(formData.capacity)
      })
      setFormData({ model: '', code: '', capacity: '' })
      loadData()
      alert('Uçak başarıyla eklendi!')
    } catch (error) {
      console.error('Error adding aircraft:', error)
      alert('Uçak eklenirken hata oluştu!')
    }
  }

  const handleUpdateAircraft = async () => {
    if (!editingAircraft) return
    try {
      await api.updateAircraft(editingAircraft.id, {
        model: formData.model,
        code: formData.code,
        capacity: parseInt(formData.capacity)
      })
      setEditingAircraft(null)
      setFormData({ model: '', code: '', capacity: '' })
      loadData()
      alert('Uçak bilgileri başarıyla güncellendi!')
    } catch (error) {
      console.error('Error updating aircraft:', error)
      alert('Uçak güncellenirken hata oluştu!')
    }
  }

  const handleDeleteAircraft = async (id: number) => {
    if (!confirm('Bu uçağı silmek istediğinizden emin misiniz?')) return
    try {
      await api.deleteAircraft(id)
      loadData()
      alert('Uçak başarıyla silindi!')
    } catch (error) {
      console.error('Error deleting aircraft:', error)
      alert('Uçak silinirken hata oluştu!')
    }
  }

  const startEdit = (plane: Aircraft) => {
    setEditingAircraft(plane)
    setFormData({
      model: plane.model,
      code: plane.code,
      capacity: plane.capacity.toString()
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
          <h1 className="text-3xl font-bold text-foreground">Uçaklar</h1>
          <p className="text-muted-foreground">Filodaki uçakları yönetin</p>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Uçakları Listele</TabsTrigger>
          <TabsTrigger value="add">Uçak Ekle</TabsTrigger>
          <TabsTrigger value="update">Güncelle</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Model</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Kuyruk Kodu</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Kapasitesi</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {aircraft.map((plane) => (
                    <tr key={plane.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{plane.model}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{plane.code}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{plane.capacity} kişi</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(plane)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteAircraft(plane.id)}>
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
            <h2 className="text-lg font-semibold text-foreground mb-4">Yeni Uçak Ekle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Uçak Modeli</label>
                <input
                  type="text"
                  placeholder="Boeing 737"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Kuyruk Kodu</label>
                <input
                  type="text"
                  placeholder="TC-ABC"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Kapasitesi</label>
                <input
                  type="number"
                  placeholder="180"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
            </div>
            <Button className="mt-6" onClick={handleAddAircraft}>Uçak Oluştur</Button>
          </Card>
        </TabsContent>

        <TabsContent value="update" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Uçak Bilgilerini Güncelle</h2>
            {editingAircraft ? (
              <>
                <p className="text-muted-foreground mb-4">Düzenlenen: {editingAircraft.model} ({editingAircraft.code})</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Uçak Modeli</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Kuyruk Kodu</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Kapasitesi</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleUpdateAircraft}>Güncelle</Button>
                  <Button variant="outline" onClick={() => {
                    setEditingAircraft(null)
                    setFormData({ model: '', code: '', capacity: '' })
                  }}>İptal</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">Güncellemek istediğiniz uçağı seçin</p>
                <div className="space-y-4">
                  {aircraft.map((plane) => (
                    <div
                      key={plane.id}
                      className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{plane.model}</p>
                        <p className="text-sm text-muted-foreground">
                          {plane.code} - {plane.capacity} kişilik
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => startEdit(plane)}>Güncelle</Button>
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
