import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { ModalProvider } from "@/contexts/modal-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Reggie",
  description: "Compliance and work automation engine",
    generator: 'v0.dev'
}

const allowedRoutes = [
  "/sign-in", 
  "/sign-up",
  "/forgot-password",
  "/test-token-expiration",
  ...(process.env.NODE_ENV === 'development' ? ["/sentry-example-page"] : [])
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          suppressHydrationWarning
        >
          <AppProvider>
          <AuthProvider allowedRoutes={allowedRoutes}>
            <AuthGuard allowedRoutes={allowedRoutes}>
              <SearchProvider>
                <ModalProvider>
                  <ChatSessionProvider>
                    <AiPanelProvider>
                      {children}
                    </AiPanelProvider>
                  </ChatSessionProvider>
                </ModalProvider>
              </SearchProvider>
            </AuthGuard>
          </AuthProvider>
          <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import AuthGuard from "@/components/auth-guard"
import { SearchProvider } from "@/contexts/search-context"
import { cn } from "@/lib/utils"
import { AppProvider } from "@/config/AppProvider"
import { ChatSessionProvider } from "@/features/chats/ChatSessionContext"
import { AiPanelProvider } from "@/contexts/ai-panel-context"

