import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Search, MoreVertical, Paperclip, Send, Check, X } from "lucide-react";
import { Contact, Message } from "./type";

interface ChatViewProps {
  selectedConversation: string | null;
  messages: Message[];
  contact: Contact | null;
  isLoading: boolean;
  onSendMessage: (content: string, attachments?: File[]) => void;
  currentUserId: string;
}

const ChatView: React.FC<ChatViewProps> = ({
  selectedConversation,
  messages,
  contact,
  isLoading,
  onSendMessage,
  currentUserId,
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [messageInput]);

  const handleSendMessage = () => {
    if (!messageInput.trim() && attachments.length === 0) return;
    onSendMessage(messageInput, attachments);
    setMessageInput("");
    setAttachments([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...filesArray]);
      // Reset the input value so the same file can be selected again
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full p-4 bg-slate-50">
        <div className="bg-white rounded-full p-8 mb-6 shadow-sm">
          <Search className="h-12 w-12 text-gray-300" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          No conversation selected
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          Select a conversation from the sidebar to view messages or start a new
          conversation.
        </p>
      </div>
    );
  }

  // Group messages by date
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
    <div className="flex-1 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-indigo-600 text-white">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 animate-pulse" />
              <div>
                <div className="h-4 w-32 mb-1 bg-white/20 animate-pulse rounded" />
                <div className="h-3 w-24 bg-white/20 animate-pulse rounded" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 border-2 border-white/20 rounded-full">
                <div
                  className={`rounded-full flex items-center justify-center h-full w-full ${
                    contact?.type === "customer"
                      ? "bg-indigo-400"
                      : "bg-amber-400"
                  }`}
                >
                  <span className="font-semibold text-white">
                    {contact?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{contact?.name}</h3>
                  {contact?.online && (
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                      • Online
                    </span>
                  )}
                </div>
                {contact?.type && (
                  <span className="text-xs text-indigo-200">
                    {contact.type === "customer" ? "Customer" : "Supplier"}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md text-white hover:bg-indigo-700">
              <Search className="h-5 w-5" />
            </button>
            <button
              className="p-2 rounded-md text-white hover:bg-indigo-700"
              onClick={() => setShowContactInfo(!showContactInfo)}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="h-6 w-40 mx-auto bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-20 w-64 rounded-lg bg-gray-200 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-end">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="h-16 w-48 rounded-lg bg-gray-200 animate-pulse" />
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(messagesByDate).map(([date, messagesForDate]) => (
                <div key={date} className="space-y-4">
                  <div className="text-center">
                    <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                      {date}
                    </span>
                  </div>

                  {/* Messages for this date */}
                  {messagesForDate.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      contact={contact}
                      currentUserId={currentUserId}
                      receiverId={selectedConversation}
                    />
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-700">No messages yet</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Start the conversation by sending a message.
              </p>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div
            className={`flex flex-col gap-2 bg-white border border-gray-200 rounded-lg ${
              attachments.length > 0 ? "border-indigo-300" : ""
            }`}
          >
            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border-b border-gray-200">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700"
                  >
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      className="h-4 w-4 rounded-full hover:bg-gray-200 flex items-center justify-center"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start gap-2 px-3 py-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                multiple
              />
              <button
                className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 h-8 w-8 rounded-md flex items-center justify-center mt-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <textarea
                ref={textareaRef}
                placeholder="Type your message here"
                className="flex-1 border-0 focus:outline-none resize-none min-h-[40px] py-2 px-3"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{ overflow: "hidden" }}
              />
              <button
                className={`bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-3 py-2 mt-1 flex items-center justify-center ${
                  !messageInput.trim() && attachments.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={handleSendMessage}
                disabled={!messageInput.trim() && attachments.length === 0}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Sidebar */}
      {showContactInfo && contact && (
        <div className="w-72 border-l border-gray-200 flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-gray-200">
            <h2 className="font-semibold">Contact info</h2>
            <button
              className="p-1 rounded-md hover:bg-gray-100"
              onClick={() => setShowContactInfo(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-auto flex-1">
            <div className="p-4">
              <h3 className="font-semibold mb-4">
                About {contact.type === "customer" ? "Customer" : "Supplier"}
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-14 w-14 rounded-full">
                  <div
                    className={`rounded-full flex items-center justify-center h-full w-full ${
                      contact.type === "customer"
                        ? "bg-indigo-100"
                        : "bg-amber-100"
                    }`}
                  >
                    <span
                      className={`font-semibold ${
                        contact.type === "customer"
                          ? "text-indigo-700"
                          : "text-amber-700"
                      }`}
                    >
                      {contact.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="font-semibold text-gray-800">
                      {contact.name}
                    </h4>
                    <div className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                      <Check className="h-3 w-3 mr-1" /> Verified
                    </div>
                  </div>
                  {contact.visitorId && (
                    <p className="text-xs text-gray-500">
                      Visitor: {contact.visitorId}
                    </p>
                  )}
                  <div
                    className={`text-xs px-2 py-0.5 rounded-md inline-block mt-1 ${
                      contact.type === "customer"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {contact.type === "customer" ? "Customer" : "Supplier"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {contact.phone && (
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">Phone Number</h4>
                    <p className="text-sm text-gray-800">{contact.phone}</p>
                  </div>
                )}

                <hr className="border-gray-200" />

                {contact.email && (
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">Email</h4>
                    <p className="text-sm text-gray-800">{contact.email}</p>
                  </div>
                )}

                <hr className="border-gray-200" />

                {contact.location && (
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">Location</h4>
                    <p className="text-sm text-gray-800">{contact.location}</p>
                  </div>
                )}

                <hr className="border-gray-200" />

                {contact.lastActive && (
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">Last Active</h4>
                    <p className="text-sm text-gray-800">
                      {contact.lastActive}
                    </p>
                  </div>
                )}

                <hr className="border-gray-200" />

                {contact.joinedDate && (
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">Joined</h4>
                    <p className="text-sm text-gray-800">
                      {contact.joinedDate}
                    </p>
                  </div>
                )}

                <hr className="border-gray-200" />

                {contact.tags && contact.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {contact.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="border-gray-200" />

                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Notes</h4>
                  <textarea
                    placeholder="Add notes about this contact"
                    className="resize-none h-24 w-full p-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Message Item Component
const MessageItem: React.FC<{
  message: Message;
  contact: Contact | null;
  receiverId: string | null;
  currentUserId: string | null;
}> = ({ message, contact, receiverId, currentUserId }) => {
  const isUserMessage = message.sender === "user";

  return (
    <div
      className={`flex ${
        currentUserId === message?.sender ? "justify-end" : "justify-start"
      }`}
    >
      {!isUserMessage && (
        <div className="h-8 w-8 rounded-full mr-2 mt-1">
          <div
            className={`rounded-full flex items-center justify-center h-full w-full ${
              contact?.type === "customer" ? "bg-indigo-100" : "bg-amber-100"
            }`}
          >
            <span
              className={`font-semibold text-xs ${
                contact?.type === "customer"
                  ? "text-indigo-700"
                  : "text-amber-700"
              }`}
            >
              {contact?.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
        </div>
      )}

      <div
        className={`max-w-[70%] overflow-hidden ${
          message.attachments ? "max-w-md" : ""
        }`}
      >
        <div
          className={`rounded-lg p-3 overflow-hidden  ${
            isUserMessage
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          <p className="text-sm w-full break-all">{message.content}</p>

          {/* Render attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="relative rounded-md overflow-hidden"
                >
                  {attachment.type === "image" && attachment.url ? (
                    <img
                      src={attachment.url || "/placeholder.svg"}
                      alt="Attachment"
                      className="w-full h-auto object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 p-2 rounded flex items-center justify-center">
                      <span className="text-xs truncate">
                        {attachment.name}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center mt-1">
          <span className="text-xs text-gray-500">{message.time}</span>
          {/* {isUserMessage && message.status === "read" && (
            <Check className="h-3 w-3 ml-1 text-indigo-500" />
          )} */}
        </div>
      </div>

      {isUserMessage && (
        <div className="h-8 w-8 rounded-full ml-2 mt-1 bg-gray-200 flex items-center justify-center">
          <span className="font-semibold text-gray-700 text-xs">Y</span>
        </div>
      )}
    </div>
  );
};

export default ChatView;
