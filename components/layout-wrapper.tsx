"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"

interface LayoutWrapperProps {
  children: React.ReactNode
}

/**
 * Wrapper component that conditionally shows SiteHeader
 * Excludes header on login page
 */
export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <>
      {!isLoginPage && <SiteHeader />}
      {children}
    </>
  )
}

