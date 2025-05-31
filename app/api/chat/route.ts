import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextResponse } from "next/server"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Add system message to encourage markdown formatting
    const enhancedMessages = [
      {
        role: "system",
        content:
          "You are a helpful assistant. Format your responses using markdown for better readability. Use headings, lists, code blocks with syntax highlighting, tables, and other markdown features when appropriate.",
      },
      ...messages,
    ]

    const result = streamText({
      model: openai("gpt-4o"),
      messages: enhancedMessages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in /api/chat:", error);

    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    let statusCode = 500;
    if (typeof error === 'object' && error !== null && 'status' in error && typeof (error as any).status === 'number') {
      statusCode = (error as any).status;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: statusCode },
    );
  }
}

