"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getCurrentUser, login, logout } from "@/lib/auth"

type User = {
  id: string
  username: string
  email: string
} | null

type AuthContextType = {
  user: User
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const checkUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [])

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const userData = await login(username, password)
      setUser(userData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

