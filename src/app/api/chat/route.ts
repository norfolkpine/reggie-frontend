import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
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
}

