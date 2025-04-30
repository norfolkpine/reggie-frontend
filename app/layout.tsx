import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { ModalProvider } from "@/contexts/modal-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Reggie Australia",
  description: "Corporate Compliance",
    generator: 'v0.dev'
}

const allowedRoutes = [
  "/sign-in", 
  "/sign-up",
  "/forgot-password",
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard allowedRoutes={allowedRoutes}>
            <SearchProvider>
              <ModalProvider>
                {children}
              </ModalProvider>
            </SearchProvider>
          </AuthGuard>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}



import AuthGuard from "@/components/auth-guard"
import { SearchProvider } from "@/contexts/search-context"
import { cn } from "@/lib/utils"

