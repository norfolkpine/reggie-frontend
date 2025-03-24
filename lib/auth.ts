// Authentication utilities for JWT

// Types
type User = {
  id: string
  username: string
  email: string
}

type LoginResponse = {
  access: string
  refresh: string
  user: User
}

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

// Store tokens in localStorage
const storeTokens = (access: string, refresh: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", access)
    localStorage.setItem("refreshToken", refresh)
  }
}

// Get tokens from localStorage
const getTokens = () => {
  if (typeof window !== "undefined") {
    return {
      accessToken: localStorage.getItem("accessToken"),
      refreshToken: localStorage.getItem("refreshToken"),
    }
  }
  return { accessToken: null, refreshToken: null }
}

// Clear tokens from localStorage
const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }
}

// Login function
export async function login(username: string, password: string): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/api/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    const data: LoginResponse = await response.json()
    storeTokens(data.access, data.refresh)

    // Fetch user data if not included in token response
    const userData = await getCurrentUser()
    return userData
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

// Refresh token function
export async function refreshToken(): Promise<string | null> {
  const { refreshToken } = getTokens()

  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(`${API_URL}/api/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      clearTokens()
      throw new Error("Token refresh failed")
    }

    const data = await response.json()
    storeTokens(data.access, refreshToken)
    return data.access
  } catch (error) {
    clearTokens()
    console.error("Token refresh error:", error)
    return null
  }
}

// Get current user function
export async function getCurrentUser(): Promise<User | null> {
  const { accessToken } = getTokens()

  if (!accessToken) {
    return null
  }

  try {
    const response = await fetch(`${API_URL}/api/users/me/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh the token
        const newToken = await refreshToken()
        if (newToken) {
          // Retry with new token
          const retryResponse = await fetch(`${API_URL}/api/users/me/`, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          })

          if (retryResponse.ok) {
            return await retryResponse.json()
          }
        }
      }
      throw new Error("Failed to get user data")
    }

    return await response.json()
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Logout function
export async function logout(): Promise<void> {
  clearTokens()
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const { accessToken } = getTokens()
  return !!accessToken
}

