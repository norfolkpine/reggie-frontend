"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useChatSessionContext } from "@/features/chats/ChatSessionContext";
import { useMobileNav } from "@/contexts/mobile-nav-context";

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  agent: string;
}

interface ChatSection {
  title: string;
  items: ChatHistoryItem[];
  expanded: boolean;
}

interface ChatHistoryProps {
  isMobile?: boolean;
}

export function ChatHistory({ isMobile = false }: ChatHistoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { close: closeMobileNav } = useMobileNav();

  const [chatSections, setChatSections] = useState<ChatSection[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const {
    chatSessions,
    isLoading: isLoadingChats,
    page: chatPage,
    deleteSession,
    renameSession,
  } = useChatSessionContext();

  // Extract session id from URL
  const match = pathname.match(/\/chat\/(\w+)/);
  const selectedSessionId = match ? match[1] : null;

  // Build chat sections from chat sessions
  const memoizedChatSections = useMemo(() => {
    const today: ChatHistoryItem[] = [];
    const history: ChatHistoryItem[] = [];
    const nowStr = new Date().toDateString();

    chatSessions.forEach((s) => {
      const updated = new Date(s.updated_at);
      const chatItem: ChatHistoryItem = {
        id: s.session_id,
        title: s.title,
        timestamp:
          updated.toDateString() === nowStr
            ? updated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : updated.toLocaleDateString(),
        agent: s.agent_code || "",
      };
      if (updated.toDateString() === nowStr) {
        today.push(chatItem);
      } else {
        history.push(chatItem);
      }
    });

    const newSections: ChatSection[] = [];
    if (today.length)
      newSections.push({ title: "Today", expanded: true, items: today });
    if (history.length)
      newSections.push({ title: "History", expanded: true, items: history });
    return newSections;
  }, [chatSessions]);

  // Update chat sections state when memoized sections change
  useEffect(() => {
    setChatSections(memoizedChatSections);
  }, [memoizedChatSections]);

  // Chat history handlers
  const toggleChatSection = useCallback((index: number) => {
    setChatSections((prev) =>
      prev.map((section, i) =>
        i === index ? { ...section, expanded: !section.expanded } : section
      )
    );
  }, []);

  const handleChatRename = useCallback(
    (sessionId: string, currentTitle: string) => {
      setEditingSessionId(sessionId);
      setEditingTitle(currentTitle);
    },
    []
  );

  const handleChatRenameSave = useCallback(async () => {
    if (editingSessionId && editingTitle.trim()) {
      await renameSession(editingSessionId, editingTitle.trim());
      setEditingSessionId(null);
      setEditingTitle("");
    }
  }, [editingSessionId, editingTitle, renameSession]);

  const handleChatRenameCancel = useCallback(() => {
    setEditingSessionId(null);
    setEditingTitle("");
  }, []);

  const handleChatDelete = useCallback(
    async (sessionId: string) => {
      await deleteSession(sessionId);
    },
    [deleteSession]
  );

  if (chatSections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {chatSections.map((section, sectionIndex) => (
        <div key={section.title} className="mb-2">
          <button
            onClick={() => toggleChatSection(sectionIndex)}
            className="flex items-center gap-2 w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {section.expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {section.title}
          </button>

          {section.expanded && (
            <div className="space-y-1">
              {(isLoadingChats && chatPage === 1 ? [] : section.items).map(
                (item, itemIndex) => {
                  const items =
                    isLoadingChats && chatPage === 1 ? [] : section.items;
                  const isLastItem = itemIndex === items.length - 1;

                  return (
                    <div key={`chat ${item.id} ${itemIndex}`}>
                      <div
                        className={cn(
                          "rounded-lg px-2 py-1 transition-colors duration-150 group relative",
                          selectedSessionId === item.id ||
                            editingSessionId === item.id
                            ? "bg-sidebar-accent"
                            : "",
                          "hover:bg-sidebar-accent"
                        )}
                      >
                        {/* Main content area */}
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            let url = `/chat/${item.id}`;
                            if (item.agent) {
                              const params = new URLSearchParams({
                                agentId: item.agent,
                              });
                              url += `?${params.toString()}`;
                            }
                            router.push(url);
                            if (isMobile) {
                              closeMobileNav();
                            }
                          }}
                        >
                          {editingSessionId === item.id ? (
                            <div className="mb-1">
                              <Input
                                value={editingTitle}
                                onChange={(e) =>
                                  setEditingTitle(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleChatRenameSave();
                                  } else if (e.key === "Escape") {
                                    handleChatRenameCancel();
                                  }
                                }}
                                onBlur={handleChatRenameSave}
                                className="text-sm font-medium text-foreground mb-1"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <h4 className="font-medium text-sm text-foreground line-clamp-1 text-ellipsis mr-4">
                              <span>
                                {item.title
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                              <span className="inline-block bg-card text-foreground text-xs font-medium px-2 py-1 rounded-full border border-border ml-1">
                                  {item.agent &&
                                    item.agent
                                      .split("-")
                                      .pop()
                                      ?.replace(/_/g, " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                            </h4>
                          )}

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{item.timestamp}</span>
                          </div>
                        </div>

                        {/* Three dots menu */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-accent"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChatRename(item.id, item.title);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChatDelete(item.id);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
