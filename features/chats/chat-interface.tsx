// Updated ChatInterface.tsx using your Django SSE backend and react-markdown v9 compatibility

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { createChatSession } from "@/api/chat-sessions";
import { useStreamAgent } from "@/hooks/stream-agent";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<{ message: string; sessionId: string } | null>(null);

  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentId = searchParams.get("agentId") || "default";

  const { output, isStreaming, cancel } = useStreamAgent({
    streamUrl: `${API_BASE_URL}/api/v1/agent/stream-chat/`,
    agent_id: agentId,
    message: trigger?.message || "",
    sessionId: trigger?.sessionId || "",
    onDone: (finalText) => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: finalText }]);
      setStreamingMessage("");
      setTrigger(null);
    },
  });

  useEffect(() => {
    if (isStreaming) {
      setStreamingMessage(output);
    }
  }, [output, isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    let currentSessionId = sessionId;

    if (!sessionId) {
      try {
        const session = await createChatSession({ title: "New Chat", agent_id: agentId });
        currentSessionId = session?.session_id || "default-session-id";
        setSessionId(currentSessionId);
      } catch (error) {
        console.error("Failed to create chat session:", error);
        toast({ title: "Error", description: "Could not create chat session." });
        return;
      }
    }

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setStreamingMessage("");
    setTrigger({ message: input, sessionId: currentSessionId });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 p-3 rounded-lg max-w-2xl ${
              msg.role === "user" ? "bg-primary text-white ml-auto" : "bg-muted"
            }`}
          >
            <div className="prose dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="mb-4 p-3 rounded-lg max-w-2xl bg-muted">
            <div className="prose dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {streamingMessage}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-background">
        <Card className="p-2">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              disabled={isStreaming}
            />
            <Button type="submit" disabled={!input.trim() || isStreaming}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
