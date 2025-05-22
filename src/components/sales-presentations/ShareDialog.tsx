
import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CopyIcon, CheckIcon, Calendar, Mail, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/utils/toast-utils';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (options: ShareOptions) => Promise<void>;
  shareLink: string | null;
  isSharing: boolean;
  presentationTitle?: string;
}

interface ShareOptions {
  recipientEmail?: string;
  message?: string;
  expiresAt?: Date | null;
  allowDownloads?: boolean;
}

export function ShareDialog({ 
  open, 
  onOpenChange, 
  onShare, 
  shareLink,
  isSharing,
  presentationTitle = 'Sales Presentation'
}: ShareDialogProps) {
  const [tab, setTab] = useState<'link' | 'email'>('link');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [allowDownloads, setAllowDownloads] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setRecipientEmail('');
      setMessage('');
      setDate(null);
      setCopied(false);
      setAllowDownloads(false);
      setTab('link');
    }
  }, [open]);
  
  // Focus input when link is generated
  useEffect(() => {
    if (shareLink && linkInputRef.current) {
      setTimeout(() => {
        linkInputRef.current?.select();
      }, 100);
    }
  }, [shareLink]);

  const handleShare = async () => {
    await onShare({
      recipientEmail: tab === 'email' ? recipientEmail : undefined,
      message: message || undefined,
      expiresAt: date,
      allowDownloads
    });
  };

  const copyToClipboard = () => {
    if (shareLink && linkInputRef.current) {
      linkInputRef.current.select();
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const sendEmail = async () => {
    if (!recipientEmail) {
      toast.error("Please enter a recipient email");
      return;
    }
    
    await handleShare();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{presentationTitle}"</DialogTitle>
          <DialogDescription>
            {!shareLink 
              ? "Create a shareable link to send to your clients or enter their email." 
              : "Your presentation is ready to share. Copy the link below."}
          </DialogDescription>
        </DialogHeader>
        
        {!shareLink ? (
          <div className="space-y-4 py-2">
            <Tabs defaultValue="link" value={tab} onValueChange={(value) => setTab(value as 'link' | 'email')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="link">Share Link</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>
              
              <TabsContent value="link" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-downloads" className="text-sm font-medium">
                      Allow downloads
                    </Label>
                    <Switch
                      id="allow-downloads"
                      checked={allowDownloads}
                      onCheckedChange={setAllowDownloads}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="expiry" className="text-sm font-medium flex items-center gap-2">
                      <Clock size={14} /> Set expiry date
                    </Label>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>No expiration</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={date || undefined}
                          onSelect={(date) => setDate(date)}
                          initialFocus
                          disabled={(day) => day < new Date()}
                        />
                        {date && (
                          <div className="p-3 border-t border-border">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDate(null)}
                            >
                              Clear date
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="email" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="recipient"
                      type="email"
                      placeholder="client@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message (optional)</Label>
                  <Input
                    id="message"
                    placeholder="I'd like to share this presentation with you..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-downloads-email" className="text-sm font-medium">
                      Allow downloads
                    </Label>
                    <Switch
                      id="allow-downloads-email"
                      checked={allowDownloads}
                      onCheckedChange={setAllowDownloads}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="expiry-email" className="text-sm font-medium flex items-center gap-2">
                      <Clock size={14} /> Set expiry date
                    </Label>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>No expiration</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={date || undefined}
                          onSelect={(date) => setDate(date)}
                          initialFocus
                          disabled={(day) => day < new Date()}
                        />
                        {date && (
                          <div className="p-3 border-t border-border">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDate(null)}
                            >
                              Clear date
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="sm:justify-end">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {tab === 'link' ? (
                <Button onClick={handleShare} disabled={isSharing}>
                  {isSharing ? 'Creating...' : 'Create Share Link'}
                </Button>
              ) : (
                <Button onClick={sendEmail} disabled={isSharing}>
                  <Mail className="mr-2 h-4 w-4" />
                  {isSharing ? 'Sending...' : 'Send Email'}
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center space-x-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1"
                ref={linkInputRef}
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            <DialogFooter className="sm:justify-end">
              <Button onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
