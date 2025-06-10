
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  Minimize2, 
  Maximize2, 
  X, 
  Sparkles,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { AIMessage, AIConversation } from '@/types/aiAssistant';

interface AIAssistantProps {
  contextData?: any;
  currentPage?: string;
}

export function AIAssistant({ contextData, currentPage }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    conversation,
    isLoading,
    sendMessage,
    getSuggestions,
    clearConversation
  } = useAIAssistant({ contextData, currentPage });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    await sendMessage(message);
    setMessage('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const suggestions = getSuggestions();

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
        >
          <Bot className="h-6 w-6" />
        </Button>
        {suggestions.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center animate-pulse"
          >
            {suggestions.length}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={cn(
        "w-96 shadow-2xl transition-all duration-200",
        isMinimized ? "h-16" : "h-[600px]"
      )}>
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="h-5 w-5" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />
            </div>
            <CardTitle className="text-sm">WorkflowGPT</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 h-[calc(600px-80px)] flex flex-col">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversation.messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-sm">Hi! I'm WorkflowGPT, your AI assistant.</p>
                    <p className="text-xs mt-1">Ask me anything about your publishing workflows!</p>
                  </div>
                )}
                
                {conversation.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {msg.role === 'user' ? (
                        <span className="text-xs font-medium">U</span>
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      msg.role === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}>
                      {msg.content}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.actions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => action.handler()}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2 border-t bg-muted/50">
                <div className="text-xs text-muted-foreground mb-2">Suggestions:</div>
                <div className="flex flex-wrap gap-1">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!message.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
