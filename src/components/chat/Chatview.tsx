import type React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
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
import { Contact, Message } from "./type";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useMessageReads } from "@/hooks/useMesssageReads";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isViewingRef = useRef(false);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      // Mark messages as read after user has been viewing for 1 second
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
    // Allow sending if there's text content OR attachments
    if (!messageInput.trim() && attachments.length === 0) return;
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

  const messagesByDate = messages.reduce(
    (groups: Record<string, Message[]>, message) => {
      const date = message.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {}
  );

  return (
    <div className="flex-1 flex bg-white">
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
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
                    src={contact?.avatar_url || "/placeholder.svg"}
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
              className="p-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 hover:scale-105"
              onClick={() => setShowContactInfo(!showContactInfo)}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-slate-50/30 to-white">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-24 w-80 rounded-2xl bg-slate-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(messagesByDate).map(([date, messagesForDate]) => (
                <div key={date} className="space-y-6">
                  <div className="text-center">
                    <span className="text-xs bg-white text-slate-600 px-4 py-2 rounded-full shadow-sm border border-slate-200 font-semibold">
                      {date}
                    </span>
                  </div>
                  {messagesForDate.map((message, index) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      contact={contact}
                      currentUserId={currentUserId}
                      showTime={shouldShowTime(
                        message,
                        messagesForDate[index - 1]
                      )}
                      messageReads={messageReads}
                      getFileIcon={getFileIcon}
                    />
                  ))}
                </div>
              ))}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
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
              )}

              <div ref={messagesEndRef} />
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

          <div className="flex-1 p-6 space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">
                Contact Information
              </h4>
              <div className="space-y-3">
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-slate-600 text-sm">@</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="text-sm font-medium text-slate-900">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                )}
                {contact.joinedDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-slate-600 text-sm">📅</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Joined</p>
                      <p className="text-sm font-medium text-slate-900">
                        {contact.joinedDate}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Message Item Component - Only show read marks for user's own messages
const MessageItem: React.FC<{
  message: Message;
  contact: Contact | null;
  currentUserId: string;
  showTime: boolean;
  messageReads: Record<string, any>;
  getFileIcon: (fileName: string) => React.ReactNode;
}> = ({
  message,
  contact,
  currentUserId,
  showTime,
  messageReads,
  getFileIcon,
}) => {
  const isUserMessage = message.sender === currentUserId;

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
      className={`flex ${isUserMessage ? "justify-end" : "justify-start"} group`}
    >
      {!isUserMessage && (
        <Avatar className="h-10 w-10 mr-3 mt-1 ring-2 ring-white shadow-md">
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

        {/* Time and Status - Only show read marks for user's own messages */}
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
          <AvatarFallback className="bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700 font-bold text-xs">
            Y
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatView;
