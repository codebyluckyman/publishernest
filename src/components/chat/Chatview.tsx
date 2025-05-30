import type React from "react";
import type { ReactNode } from "react";
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  Search,
  MoreVertical,
  Paperclip,
  Send,
  Check,
  X,
  Download,
  FileText,
  ImageIcon,
  CheckCheck,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Contact, Message } from "./type";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useMessageReads } from "@/hooks/useMesssageReads";
import { useMessageSearch } from "@/hooks/useMessageSearch";
import { ChatSearch } from "./ChatSearch";

import InfiniteScroll from "react-infinite-scroll-component";
import { useAuth } from "@/context/AuthContext";

interface ChatViewProps {
  selectedConversation: string | null;
  messages: Message[];
  contact: Contact | null;
  isLoading: boolean;
  onSendMessage: (content: string, attachments?: File[]) => void;
  currentUserId: string;
  roomId: string | null;
}

const ChatView: React.FC<ChatViewProps> = ({
  selectedConversation,
  messages,
  contact,
  isLoading,
  onSendMessage,
  currentUserId,
  roomId,
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 10; // Number of messages to load per page
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isViewingRef = useRef(false);
  const shouldStickToBottom = useRef(true);
  const isPrepend = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use typing indicator hook
  const { typingUsers, handleInputChange, stopTyping } = useTypingIndicator(
    roomId,
    currentUserId
  );

  // Use message reads hook
  const { messageReads, markMessagesAsRead, isMarkingAsRead } = useMessageReads(
    roomId,
    currentUserId
  );

  const fetchData = () => {
    if (!hasMore) return;

    setIsLoadingMore(true);

    setTimeout(() => {
      setCurrentPage((prevPage) => prevPage + 1);
      setIsLoadingMore(false);
    }, 1000);
  };

  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    searchMessages,
    isSearching,
  } = useMessageSearch(roomId);

  const shouldShowTime = (
    currentMessage: Message,
    previousMessage?: Message
  ) => {
    if (!previousMessage) return true;
    const currentTime = new Date(
      `${currentMessage.date} ${currentMessage.time}`
    );
    const previousTime = new Date(
      `${previousMessage.date} ${previousMessage.time}`
    );
    const timeDifference = Math.abs(
      currentTime.getTime() - previousTime.getTime()
    );
    const minutesDifference = timeDifference / (1000 * 60);
    return (
      minutesDifference > 2 || currentMessage.sender !== previousMessage.sender
    );
  };

  // Create message items with date separators - fix ordering
  const messageItems = useMemo(() => {
    const items: Array<{ type: "date" | "message"; data: any; id: string }> =
      [];
    let lastDate = "";

    // Sort messages chronologically (oldest first)
    const sortedMessages = [...messages].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`).getTime();
      const dateB = new Date(`${b.date} ${b.time}`).getTime();
      return dateA - dateB;
    });

    sortedMessages.forEach((message, index) => {
      const currentDate = message.date;

      // Add date separator if date changed
      if (currentDate !== lastDate) {
        items.push({
          type: "date",
          data: { date: currentDate },
          id: `date-${currentDate}`,
        });
        lastDate = currentDate;
      }

      // Determine if we should show time for this message
      const showTime = shouldShowTime(
        message,
        index > 0 ? sortedMessages[index - 1] : undefined
      );

      items.push({
        type: "message",
        data: { message, showTime },
        id: `message-${message.id}`,
      });
    });

    return items;
  }, [messages]);

  const visibleItems = useMemo(() => {
    return messageItems.slice(-currentPage * messagesPerPage);
  }, [messageItems, currentPage, messagesPerPage]);

  const visibleCount = visibleItems.length;
  const hasMore = visibleCount < messageItems.length;

  useLayoutEffect(() => {
    isPrepend.current = false;
  });

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchTerm("");
    }
  }, [isSearchOpen, setSearchTerm]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 50)}px`;
    }
  }, [messageInput]);

  // Mark messages as read when the conversation is opened or when new messages arrive
  useEffect(() => {
    if (roomId && messages.length > 0 && !isMarkingAsRead) {
      isViewingRef.current = true;

      const timer = setTimeout(() => {
        if (isViewingRef.current) {
          markMessagesAsRead(roomId);
        }
      }, 1000);

      return () => {
        clearTimeout(timer);
        isViewingRef.current = false;
      };
    }
  }, [roomId, messages.length, markMessagesAsRead, isMarkingAsRead]);

  // Mark messages as read when user scrolls to bottom or interacts
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && roomId && isViewingRef.current) {
        markMessagesAsRead(roomId);
      }
    };

    const handleFocus = () => {
      if (roomId && isViewingRef.current) {
        markMessagesAsRead(roomId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [roomId, markMessagesAsRead]);

  const handleSendMessage = () => {
    if (!messageInput.trim() && attachments.length === 0) return;
    shouldStickToBottom.current = true;
    onSendMessage(messageInput, attachments);
    setMessageInput("");
    setAttachments([]);
    stopTyping();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...filesArray]);
      e.target.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChangeWithTyping = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMessageInput(e.target.value);
    handleInputChange();
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <ImageIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleSearchResultClick = useCallback(
    (messageId: string) => {
      const messageIndex = messageItems.findIndex(
        (item) => item.type === "message" && item.data.message.id === messageId
      );

      if (messageIndex !== -1) {
        const targetPage = Math.ceil((messageIndex + 1) / messagesPerPage);
        setCurrentPage(targetPage);
        setIsSearchOpen(false);
        setSearchTerm("");

        // Enhanced highlighting with blue theme
        setTimeout(() => {
          const element = document.querySelector(
            `[data-message-id="${messageId}"]`
          );
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add(
              "ring-2",
              "ring-blue-500",
              "bg-blue-100",
              "shadow-lg",
              "transition-all",
              "duration-500"
            );

            // Remove highlighting after 3 seconds
            setTimeout(() => {
              element.classList.remove(
                "ring-2",
                "ring-blue-500",
                "bg-blue-100",
                "shadow-lg",
                "transition-all",
                "duration-500"
              );
            }, 3000);
          }
        }, 100);
      }
    },
    [messageItems, messagesPerPage, setSearchTerm]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      searchMessages(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchMessages]);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="bg-white rounded-3xl p-16 mb-8 shadow-xl border border-slate-200/60">
          <Search className="h-20 w-20 text-slate-300" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Select a conversation
        </h2>
        <p className="text-slate-500 text-center max-w-lg leading-relaxed text-lg">
          Choose a conversation from the sidebar to start messaging or view your
          chat history.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-white">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="flex items-center justify-between p-3 border-b border-slate-200/60 bg-white shadow-sm">
            {isLoading ? (
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-slate-200 animate-pulse" />
                <div>
                  <div className="h-6 w-40 mb-2 bg-slate-200 animate-pulse rounded-lg" />
                  <div className="h-4 w-32 bg-slate-200 animate-pulse rounded-lg" />
                </div>
              </div>
            ) : contact ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 ring-4 ring-white shadow-lg border-2 border-slate-100">
                    <AvatarImage
                      src={contact?.avatar_url}
                      alt={contact?.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white font-bold text-lg">
                      {contact?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {contact?.online && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-3 border-white shadow-lg">
                      <div className="h-full w-full bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-900 text-xl">
                      {contact?.name}
                    </h3>
                    {contact?.online && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-200">
                        • Online
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 font-medium">
                      {contact?.type?.charAt(0).toUpperCase() +
                        contact?.type?.slice(1)}
                    </span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full" />
                    {typingUsers.length > 0 && (
                      <span className="text-sm text-indigo-600 font-medium italic">
                        typing...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-slate-200" />
                <div>
                  <div className="h-6 w-40 mb-2 bg-slate-200 rounded-lg" />
                  <div className="h-4 w-32 bg-slate-200 rounded-lg" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                className={`p-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 ${isSearchOpen ? "bg-slate-100 text-slate-700" : ""}`}
                onClick={toggleSearch}
                aria-label={isSearchOpen ? "Close search" : "Search messages"}
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                className={`p-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 hover:scale-105 ${showContactInfo ? "bg-slate-100 text-slate-700" : ""}`}
                onClick={() => setShowContactInfo(!showContactInfo)}
                aria-label={
                  showContactInfo ? "Hide contact info" : "Show contact info"
                }
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search Component - Right after header */}
          {isSearchOpen && (
            <ChatSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchResults={searchResults}
              onResultClick={handleSearchResultClick}
              onClearSearch={() => setSearchTerm("")}
              isSearching={isSearching}
            />
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 bg-gradient-to-b from-slate-50/30 to-white">
          {isLoading ? (
            <div className="p-6 space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-24 w-80 rounded-2xl bg-slate-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : messageItems.length > 0 ? (
            <div
              id="scrollableDiv"
              style={{
                width: "100%",
                height: "calc(100vh - 31rem)",
                overflowY: "scroll",
                display: "flex",
                flexDirection: "column-reverse",
                margin: "auto",
              }}
              className="bg-body-tertiary p-3"
            >
              <InfiniteScroll
                dataLength={visibleCount}
                next={fetchData}
                hasMore={hasMore}
                loader={
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                }
                style={{
                  display: "flex",
                  flexDirection: "column-reverse",
                  overflow: "visible",
                }}
                scrollableTarget="scrollableDiv"
                inverse={true}
              >
                {messageItems
                  .slice() // Create a shallow copy to avoid mutating the original
                  .reverse() // Reverse the array for display
                  .slice(0, currentPage * messagesPerPage)
                  .map((item) => (
                    <div key={item.id} className="px-6 py-2">
                      {item.type === "date" ? (
                        <div className="text-center py-4">
                          <span className="text-xs bg-white text-slate-600 px-4 py-2 rounded-full shadow-sm border border-slate-200 font-semibold">
                            {item.data.date}
                          </span>
                        </div>
                      ) : (
                        <MessageItem
                          message={item.data.message}
                          contact={contact}
                          currentUserId={currentUserId}
                          showTime={item.data.showTime}
                          messageReads={messageReads}
                          getFileIcon={getFileIcon}
                        />
                      )}
                    </div>
                  ))}
                <div ref={messagesEndRef} />
                {typingUsers.length > 0 && (
                  <div className="px-6 py-2">
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3 max-w-[80%]">
                        <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                          <AvatarImage
                            src={contact?.avatar_url || "/placeholder.svg"}
                            alt={contact?.name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white font-bold text-xs">
                            {contact?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white text-slate-900 border border-slate-200 shadow-md rounded-2xl px-4 py-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isLoadingMore && (
                  <div className="px-6 py-4 text-center">
                    <div className="text-sm text-slate-500">
                      Loading more messages...
                    </div>
                  </div>
                )}
              </InfiniteScroll>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white rounded-3xl p-8 mb-8 shadow-lg border border-slate-200">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-800 text-xl mb-3">
                No messages yet
              </h3>
              <p className="text-slate-500 text-center leading-relaxed">
                Start the conversation by sending your first message.
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Message Input */}
        <div className="p-6 border-t border-slate-200/60 bg-white">
          <div className="bg-white border-2 border-slate-200/60 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4">
              <Textarea
                ref={textareaRef}
                placeholder={`Message ${contact?.name || ""}...`}
                className="min-h-[60px] bg-transparent border-0 text-slate-900 placeholder:text-slate-500 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm leading-relaxed"
                value={messageInput}
                onChange={handleInputChangeWithTyping}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="px-6 pb-4 border-t border-slate-100">
                <div className="mt-4 space-y-3">
                  <div className="text-xs text-slate-600 font-semibold">
                    Attachments ({attachments.length})
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 group hover:bg-slate-100 transition-all"
                      >
                        <div className="flex-shrink-0">
                          {file.type.startsWith("image/") ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shadow-sm">
                              <img
                                src={
                                  URL.createObjectURL(file) ||
                                  "/placeholder.svg"
                                }
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                              {getFileIcon(file.name)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                            {file.type || "Unknown type"}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </div>
              <Button
                size="sm"
                className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-8 w-8 p-0 rounded-md shadow-lg transition-all ${
                  !messageInput.trim() && attachments.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-xl hover:scale-105"
                }`}
                onClick={handleSendMessage}
                disabled={!messageInput.trim() && attachments.length === 0}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Sidebar */}
      {showContactInfo && contact && (
        <div className="w-96 border-l border-slate-200/60 flex flex-col bg-gradient-to-b from-slate-50/30 to-white">
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 ring-4 ring-white shadow-xl">
                <AvatarImage
                  src={contact.avatar_url || "/placeholder.svg"}
                  alt={contact.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white font-bold text-2xl">
                  {contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-xl text-slate-900 mb-2">
                {contact.name}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-600 font-medium">
                  {contact.type?.charAt(0).toUpperCase() +
                    contact.type?.slice(1)}
                </span>
                {contact.online && (
                  <>
                    <span className="w-1 h-1 bg-slate-400 rounded-full" />
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
                      Online
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-lg">
                Contact Information
              </h4>
              <div className="space-y-4">
                {contact.email && (
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-lg">✉</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-500 font-medium">
                        Email Address
                      </p>
                      <p className="text-sm font-semibold text-slate-900 break-all">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-lg">📞</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-500 font-medium">
                        Phone Number
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {contact.phone}
                      </p>
                    </div>
                  </div>
                )}

                {contact.location && (
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 text-lg">📍</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-500 font-medium">
                        Location
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {contact.location}
                      </p>
                    </div>
                  </div>
                )}

                {contact.joinedDate && (
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 text-lg">📅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-500 font-medium">
                        Member Since
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {contact.joinedDate}
                      </p>
                    </div>
                  </div>
                )}

                {contact.lastActive && (
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-600 text-lg">⏰</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-500 font-medium">
                        Last Active
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {contact.lastActive}
                      </p>
                    </div>
                  </div>
                )}

                {contact.visitorId && (
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 text-lg">🆔</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-500 font-medium">
                        Visitor ID
                      </p>
                      <p className="text-sm font-mono font-semibold text-slate-900 break-all">
                        {contact.visitorId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {contact.tags && contact.tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-4 text-lg">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Message Item Component
interface MessageItemProps {
  message: Message;
  contact: Contact | null;
  currentUserId: string;
  showTime: boolean;
  messageReads: Record<string, any>;
  getFileIcon: (fileName: string) => ReactNode;
  highlighted?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  contact,
  currentUserId,
  showTime,
  messageReads,
  getFileIcon,
  highlighted,
}) => {
  const isUserMessage = message.sender === currentUserId;

  const { userProfile } = useAuth();

  // Get read status only for user's own messages
  const readStatus = useMemo(() => {
    if (!isUserMessage) {
      return { status: "delivered", readCount: 0, readByOthers: false };
    }

    const messageReadData = messageReads[message.id];
    if (!messageReadData)
      return { status: "sent", readCount: 0, readByOthers: false };

    const readByOthers = messageReadData.isReadByOthers || false;
    const readCount = messageReadData.totalReaders || 0;
    const readByUsers = messageReadData.readByUsers || [];

    if (readByOthers) {
      return { status: "read", readCount, readByOthers: true, readByUsers };
    } else if (readCount > 0) {
      return {
        status: "delivered",
        readCount,
        readByOthers: false,
        readByUsers,
      };
    } else {
      return { status: "sent", readCount: 0, readByOthers: false, readByUsers };
    }
  }, [messageReads, message.id, isUserMessage]);

  return (
    <div
      className={`flex ${isUserMessage ? "justify-end" : "justify-start"} group py-2`}
      data-message-id={message.id}
    >
      {/* Rest of the component remains the same... */}
      {!isUserMessage && (
        <Avatar className="h-10 w-10 mr-3 mt-1 ring-2 ring-white shadow-md">
          <AvatarImage src={contact?.avatar_url} alt={contact?.name} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white font-bold text-xs">
            {contact?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="max-w-[70%]">
        <div
          className={`rounded-2xl overflow-hidden shadow-lg transition-all relative ${
            isUserMessage
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              : "bg-white text-slate-900 border border-slate-200 shadow-md"
          }`}
        >
          {message.content && (
            <div className="px-4 py-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
                {message.content}
              </p>
            </div>
          )}

          {/* File attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`px-4 ${message.content ? "pt-0 pb-3" : "py-3"}`}>
              <div className="space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isUserMessage
                        ? "bg-white/10 hover:bg-white/20"
                        : "bg-slate-50 hover:bg-slate-100"
                    } transition-all cursor-pointer group`}
                    onClick={() => {
                      if (attachment.url) {
                        window.open(attachment.url, "_blank");
                      }
                    }}
                  >
                    <div className="flex-shrink-0">
                      {attachment.type === "image" ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100">
                          <img
                            src={attachment.url || "/placeholder.svg"}
                            alt={attachment.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isUserMessage ? "bg-white/20" : "bg-white"
                          }`}
                        >
                          {getFileIcon(attachment.name || "")}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${isUserMessage ? "text-white" : "text-slate-900"}`}
                      >
                        {attachment.name}
                      </div>
                      {attachment.size && (
                        <div
                          className={`text-xs mt-1 ${isUserMessage ? "text-white/70" : "text-slate-500"}`}
                        >
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <Download
                        className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isUserMessage ? "text-white" : "text-slate-500"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Time and Status */}
        {showTime && (
          <div
            className={`flex items-center mt-2 gap-2 ${isUserMessage ? "justify-end" : "justify-start"}`}
          >
            <span className="text-xs text-slate-500 font-medium">
              {message.time}
            </span>

            {/* Only show read status for user's own messages */}
            {isUserMessage && (
              <div className="flex items-center gap-1">
                {readStatus.status === "read" ? (
                  <CheckCheck className="h-4 w-4 text-blue-500" />
                ) : readStatus.status === "delivered" ? (
                  <CheckCheck className="h-4 w-4 text-slate-400" />
                ) : (
                  <Check className="h-4 w-4 text-slate-400" />
                )}
                <span className="text-xs text-slate-400 ml-1">
                  {readStatus.status === "read"
                    ? "Read"
                    : readStatus.status === "delivered"
                      ? "Delivered"
                      : "Sent"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {isUserMessage && (
        <Avatar className="h-10 w-10 ml-3 mt-1 ring-2 ring-white shadow-md">
          <AvatarImage
            src={userProfile.avatar_url}
            alt={userProfile?.email}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700 font-bold text-xs">
            Y
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatView;
