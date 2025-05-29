"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { History, X, FileSearch, Plus, MessageSquare } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import SearchInput from "@/components/ui/search-input";
import { getChatSessions, ChatSession } from "@/api/chat-sessions";
import { useRouter } from "next/navigation";

interface HistoryPopupProps {
  onSelectChat?: (chatId: string, agentCode?: string | null) => void;
  onNewChat?: () => void;
}

export function HistoryPopup({ onSelectChat, onNewChat }: HistoryPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch chat sessions when popup is opened
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchChatSessions();
    }
  }, [isOpen]);

  const fetchChatSessions = async () => {
    try {
      const response = await getChatSessions();
      setChatSessions(response.results);
      setFilteredSessions(response.results);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      setIsLoading(false);
    }
  };

  // Filter sessions based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSessions(chatSessions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = chatSessions.filter(
        (session) =>
          session.title.toLowerCase().includes(query)
      );
      setFilteredSessions(filtered);
    }
  }, [searchQuery, chatSessions]);

  const handleSelectChat = (chatId: string,agentCode?: string | null) => {
    if (onSelectChat) {
      onSelectChat(chatId,agentCode);
    } else {
      // Default navigation if no handler provided
      let url = `/chat/${chatId}`;
      if (agentCode) {
        const params = new URLSearchParams({ agentId:agentCode });
        url += `?${params.toString()}`;
      }
      router.push(url);
    }
    setIsOpen(false);
  };

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      // Default navigation if no handler provided
      router.push("/chat/new");
    }
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  // New component for empty state
  const EmptyState = ({ hasSearch }: { hasSearch: boolean }) => (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="bg-muted/30 p-4 rounded-full mb-4">
        {hasSearch ? (
          <FileSearch className="h-8 w-8 text-muted-foreground/70" />
        ) : (
          <MessageSquare className="h-8 w-8 text-muted-foreground/70" />
        )}
      </div>
      <h4 className="text-base font-medium mb-1">
        {hasSearch ? "No matches found" : "No conversations yet"}
      </h4>
      <p className="text-sm text-muted-foreground mb-4">
        {hasSearch 
          ? "Try a different search term or clear your search" 
          : "Start a new conversation to chat with the AI assistant"
        }
      </p>
      {hasSearch ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSearchQuery("")}
          className="min-w-[120px]"
        >
          Clear search
        </Button>
      ) : (
        <Button 
          variant="default" 
          size="sm"
          onClick={handleNewChat}
          className="min-w-[120px]"
        >
          Start chatting
        </Button>
      )}
    </div>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="View chat history"
        >
          <HamburgerMenuIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] sm:w-[350px] md:w-[400px] p-0"
        align="start"
        sideOffset={10}
      >
        <div className="flex items-center justify-between border-b p-3 bg-background">
          <h3 className="font-medium">Chat History</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="border-b p-3">
          <div className="relative">
            <SearchInput 
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="p-2 border-b">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[60px]" />
                </div>
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div
                key={session.session_id}
                className="flex flex-col gap-1 rounded-md p-3 hover:bg-muted cursor-pointer transition-colors"
                onClick={() => handleSelectChat(session.session_id, session.agent_code)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm line-clamp-1">{session.title}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDate(session.updated_at)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {session.agent_code}
                </p>
              </div>
            ))
          ) : (
            <EmptyState hasSearch={searchQuery.trim().length > 0} />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 