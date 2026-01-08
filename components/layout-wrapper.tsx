"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Toaster } from "@/components/ui/toaster"

interface LayoutWrapperProps {
  children: React.ReactNode
}

/**
 * Wrapper component that conditionally shows SiteHeader
 * Excludes header on login page
 */
export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const [isLoginPage, setIsLoginPage] = useState(false)

  useEffect(() => {
    setIsLoginPage(pathname === "/login")
  }, [pathname])

  return (
    <>
      {!isLoginPage && <SiteHeader />}
      {children}
      <Toaster />
    </>
  )
}

