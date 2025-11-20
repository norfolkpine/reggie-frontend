import type React from "react"
import type { Metadata } from "next"
import { Inter, Raleway, Red_Hat_Display } from "next/font/google"
import "../styles/globals.css"

// Components
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import AuthGuard from "@/components/auth-guard"

// Contexts
import { AuthProvider } from "@/contexts/auth-context"
import { ModalProvider } from "@/contexts/modal-context"
import { SearchProvider } from "@/contexts/search-context"
import { ChatStreamProvider } from "@/contexts/chat-stream-context"
import { ChatSessionProvider } from "@/features/chats/ChatSessionContext"
import { AiPanelProvider } from "@/contexts/ai-panel-context"

// Providers
import { AppProvider } from "@/config/AppProvider"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
})

const raleway = Raleway({ 
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap"
})

const redHatDisplay = Red_Hat_Display({ 
  subsets: ["latin"],
  variable: "--font-red-hat-display",
  display: "swap"
})

export const metadata: Metadata = {
  title: "Opie",
  description: "Operational Intelligence Engine - Compliance and work automation platform",
    generator: 'opie'
}

const allowedRoutes = [
  "/sign-in", 
  "/sign-up",
  "/forgot-password",
  "/test-token-expiration",
  "/test-csrf-fix",
  ...(process.env.NODE_ENV === 'development' ? ["/sentry-example-page"] : [])
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Ancizar+Serif:ital,wght@0,300..900;1,300..900&family=Comfortaa:wght@300..700&family=Funnel+Display:wght@300..800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Raleway:ital,wght@0,100..900;1,100..900&family=Red+Hat+Display:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${raleway.variable} ${redHatDisplay.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          <AppProvider>
          <AuthProvider allowedRoutes={allowedRoutes}>
            <AuthGuard allowedRoutes={allowedRoutes}>
              <ChatStreamProvider>
                <SearchProvider>
                  <ModalProvider>
                    <ChatSessionProvider>
                      <AiPanelProvider>
                        {children}
                      </AiPanelProvider>
                    </ChatSessionProvider>
                  </ModalProvider>
                </SearchProvider>
              </ChatStreamProvider>
            </AuthGuard>
          </AuthProvider>
          <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}




