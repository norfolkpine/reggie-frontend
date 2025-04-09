"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";
import { useStreamAgent } from "@/hooks/useStreamAgent";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { v4 as uuidv4 } from "uuid";

const MarkdownComponents = {
  p: (props: any) => <p className="mb-4" {...props} />,
  code: ({ inline, ...props }: any) =>
    inline ? (
      <code className="bg-gray-100 px-1 rounded text-sm" {...props} />
    ) : (
      <pre className="bg-gray-900 text-white p-4 rounded mb-4 overflow-x-auto">
        <code {...props} />
      </pre>
    ),
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [triggerMessage, setTriggerMessage] = useState('');
  const [sessionId] = useState(() => uuidv4());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { output, isStreaming, cancel } = useStreamAgent({
    agent_id: "compliance-bot", // ✅ Replace with dynamic value if needed
    message: triggerMessage,
    sessionId,
    onDone: (final) => {
      setMessages((prev) => [...prev, { id: uuidv4(), role: "assistant", content: final }]);
      setTriggerMessage('');
    },
  });

  // Append streaming content during generation
  useEffect(() => {
    if (isStreaming) {
      setMessages((prev) => {
        const others = prev.filter((m) => m.id !== "streaming");
        return [...others, { id: "streaming", role: "assistant", content: output }];
      });
    }
  }, [output, isStreaming]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { id: uuidv4(), role: "user" as const, content: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setTriggerMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-lg whitespace-pre-wrap ${
              msg.role === "user" ? "bg-primary text-primary-foreground self-end" : "bg-muted self-start"
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={MarkdownComponents}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <Card className="p-2 border shadow-lg">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isStreaming}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
