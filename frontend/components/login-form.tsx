"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { api } from "@/lib/api"

interface LoginFormProps {
  onLoginSuccess: (token: string, username: string) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await api.login(username, password)

      if (response.success) {
        onLoginSuccess(response.token, response.username)
      } else {
        setError(response.error || "Giriş Başarısız")
      }
    } catch (err) {
      setError("Bir hata oluştu. Tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="text-3xl font-bold">Uçuş Yönetimi</h1>
          <p className="text-muted-foreground">Hesabınıza giriş yapın</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Kullanıcı Adı
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Kullanıcı adınızı giriniz"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Şifre
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Şifrenizi giriniz"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p></p>
        </div>
      </Card>
    </div>
  )
}
