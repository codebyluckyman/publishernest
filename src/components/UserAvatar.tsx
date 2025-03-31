
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  avatarUrl?: string | null;
  fallback?: string;
  className?: string;
}

const UserAvatar = ({ avatarUrl, fallback, className = "" }: UserAvatarProps) => {
  return (
    <Avatar className={className}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt="User avatar" />
      ) : null}
      <AvatarFallback className="bg-primary/10">
        {fallback ? (
          <span className="text-sm font-medium">{fallback}</span>
        ) : (
          <User className="h-4 w-4 text-muted-foreground" />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
