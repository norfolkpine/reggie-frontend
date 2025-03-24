// Base API client for Django backend
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"

export async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}/${endpoint}`

  // Get token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

  // Include authorization header if token exists
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 401 Unauthorized - attempt to refresh token
    if (response.status === 401) {
      try {
        // Import dynamically to avoid circular dependency
        const { refreshToken } = await import("./auth")
        const newToken = await refreshToken()

        // Retry the request with new token
        if (newToken) {
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
              ...options.headers,
            },
          })

          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`)
          }

          return await retryResponse.json()
        } else {
          // If refresh failed, throw authentication error
          throw new Error("Authentication failed")
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError)
        throw new Error("Authentication failed")
      }
    }

    // Handle other errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API fetch error:", error)
    throw error
  }
}

