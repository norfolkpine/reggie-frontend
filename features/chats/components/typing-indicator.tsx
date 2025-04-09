"use client";

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 p-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-typing-dot-1" />
        <div className="w-2 h-2 bg-primary rounded-full animate-typing-dot-2" />
        <div className="w-2 h-2 bg-primary rounded-full animate-typing-dot-3" />
      </div>
    </div>
  );
}