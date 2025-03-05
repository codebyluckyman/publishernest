
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
};

type LiveChatProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SAMPLE_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "agent",
    text: "Hello! How can I help you today with PublishFlow?",
    timestamp: new Date(Date.now() - 60000 * 5),
  },
];

const LiveChat: React.FC<LiveChatProps> = ({ open, onOpenChange }) => {
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    // Simulate agent typing
    setIsTyping(true);
    
    // Simulate agent response after a delay
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        text: "Thank you for your message. One of our support agents will get back to you shortly. Is there anything else I can help you with?",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden max-h-[600px] flex flex-col">
        <DialogHeader className="px-4 py-2 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span>Support Chat</span>
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div 
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === "user" 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 text-gray-800"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.sender === "agent" && (
                    <div className="bg-primary text-white p-1 rounded-full">
                      <MessageCircle className="h-3 w-3" />
                    </div>
                  )}
                  {message.sender === "user" && (
                    <div className="bg-gray-500 text-white p-1 rounded-full">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                  <span className="text-xs font-semibold">
                    {message.sender === "user" ? "You" : "Support Agent"}
                  </span>
                  <span className="text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveChat;
