import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ChatIconProps {
  unreadCount?: number;
  onClick?: () => void;
  className?: string;
}

export function MessagesPopover({
  unreadCount = 0,
  onClick,
  className,
}: ChatIconProps) {
  const navigate = useNavigate();

  return (
    <div className={cn("relative inline-block", className)}>
      <Button
        variant="ghost"
        size="icon"
        // onClick={onClick}
        onClick={() => navigate("/chat")}
        aria-label={`Chat ${
          unreadCount > 0 ? `with ${unreadCount} unread messages` : ""
        }`}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {unreadCount > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs"
          variant="destructive"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </div>
  );
}
