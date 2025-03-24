import { NextResponse } from "next/server"

export const maxDuration = 30

export async function POST(req: Request) {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
  const { messages } = await req.json()

  // Get the authorization header from the request cookies
  const { cookies } = req
  const token = cookies.get("accessToken")?.value

  try {
    // Forward the request to Django
    const response = await fetch(`${API_URL}/api/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Stream the response back to the client
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}

