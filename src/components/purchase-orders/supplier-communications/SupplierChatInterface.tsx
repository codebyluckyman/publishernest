
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Phone, Mail, Pencil, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SupplierCommunication } from "@/api/supplierCommunications/fetchSupplierCommunications";
import { DateFormatter } from "@/utils/formatters";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SupplierChatInterfaceProps {
  communications: SupplierCommunication[];
  isLoading: boolean;
  onSendMessage: (message: string, communicationType: 'email' | 'phone' | 'note' | 'other') => void;
  isSending: boolean;
}

export function SupplierChatInterface({
  communications,
  isLoading,
  onSendMessage,
  isSending
}: SupplierChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [communicationType, setCommunicationType] = useState<'email' | 'phone' | 'note' | 'other'>('note');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [communications]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    onSendMessage(message, communicationType);
    setMessage("");
    setShowTypeSelector(false);
  };
  
  const getCommunicationTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'note':
        return <Pencil className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email':
        return 'Email';
      case 'phone':
        return 'Phone Call';
      case 'note':
        return 'Note';
      default:
        return 'Other';
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-md overflow-hidden bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading communications...</p>
          </div>
        ) : communications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">No communications recorded yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start a conversation with the supplier using the input below.
            </p>
          </div>
        ) : (
          communications.map((comm) => (
            <Card key={comm.id} className="p-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-full bg-muted">
                  {getCommunicationTypeIcon(comm.communication_type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{getTypeLabel(comm.communication_type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {comm.creator?.first_name ? 
                          `${comm.creator.first_name} ${comm.creator.last_name || ''}` : 
                          comm.creator?.email || 'User'}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {DateFormatter.format(new Date(comm.communication_date))}
                    </p>
                  </div>
                  <div className="mt-2 whitespace-pre-line text-sm">
                    {comm.message}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t p-3">
        {showTypeSelector && (
          <div className="mb-3 p-3 bg-muted/30 rounded-md">
            <Label className="mb-2 block text-sm font-medium">Communication Type</Label>
            <RadioGroup 
              value={communicationType} 
              onValueChange={(value) => setCommunicationType(value as 'email' | 'phone' | 'note' | 'other')}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="text-sm">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone" className="text-sm">Phone Call</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="note" id="note" />
                <Label htmlFor="note" className="text-sm">Note</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="text-sm">Other</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        <div className="flex gap-2">
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            className={cn("rounded-full px-3", showTypeSelector && "bg-primary text-primary-foreground")}
          >
            {getCommunicationTypeIcon(communicationType)}
            <span className="ml-1">{getTypeLabel(communicationType)}</span>
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
            disabled={isSending}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!message.trim() || isSending}
            size="icon"
            type="button"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
