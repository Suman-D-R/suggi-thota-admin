"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isTokenValid } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * Client-side authentication guard
 * Checks if token is valid and redirects to login if not
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()

  useEffect(() => {
    // Check token validity on client side
    if (!isTokenValid()) {
      router.push("/login")
    }
  }, [router])

  // Don't render children if token is invalid (will redirect)
  if (!isTokenValid()) {
    return null
  }

  return <>{children}</>
}

