"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Leaf, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adminLogin, isTokenValid, saveRememberedCredentials, getRememberedCredentials, clearRememberedCredentials } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [rememberMe, setRememberMe] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  // Redirect if already logged in
  React.useEffect(() => {
    if (isTokenValid()) {
      router.push("/")
    }
  }, [router])

  // Load remembered credentials on mount
  React.useEffect(() => {
    const remembered = getRememberedCredentials()
    if (remembered) {
      setEmail(remembered.email)
      setPassword(remembered.password)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Use email as loginId for admin login
      const result = await adminLogin(email, password)
      
      if (result.success && result.token) {
        // Handle remember me functionality
        if (rememberMe) {
          saveRememberedCredentials(email, password)
        } else {
          clearRememberedCredentials()
        }
        
        // Token is already stored by adminLogin function
        // Redirect to dashboard with full page reload to ensure cookie is available
        window.location.href = "/"
      } else {
        setError(result.error || "Login failed. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Simple Header */}
      <header className="border-b bg-white/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
              <Leaf className="h-5 w-5" />
            </div>
            <span>Vitura</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <Card className="border-slate-200 shadow-lg bg-white">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Leaf className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back
              </CardTitle>
              <CardDescription className="text-slate-600">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => {
                        setRememberMe(checked === true)
                        // Clear saved credentials if user unchecks remember me
                        if (!checked) {
                          clearRememberedCredentials()
                        }
                      }}
                      className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm text-slate-600 cursor-pointer font-normal"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="#"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:shadow-md"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            © 2025 Vitura Admin. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

