import { Message } from "@/types";
import { formatTime, getInitials, avatarColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderUsername?: string;
}

export function MessageBubble({ message, isOwn, senderUsername }: MessageBubbleProps) {
  const initials = senderUsername ? getInitials(senderUsername) : "?";
  const color = senderUsername ? avatarColor(senderUsername) : "#6c63ff";

  return (
    <div
      className={cn(
        "flex items-end gap-2 max-w-[80%] animate-fade-up",
        isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar */}
      {!isOwn && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold shrink-0 mb-1"
          style={{ background: color }}
        >
          {initials}
        </div>
      )}

      <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words",
            isOwn
              ? "bg-algo-accent text-white rounded-br-sm"
              : "bg-algo-card border border-algo-border text-algo-text rounded-bl-sm"
          )}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-algo-text-muted px-1">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
