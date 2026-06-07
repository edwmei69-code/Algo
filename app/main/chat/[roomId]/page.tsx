"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChat } from "@/hooks/useChat";
import { VideoChat } from "@/components/chat/VideoChat";
import { RateMatch } from "@/components/chat/RateMatch";
import { endRoom } from "@/lib/matching";
import { recordChatCompletion } from "@/lib/competitive";
import { Profile, Room } from "@/types";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ReportModal } from "@/components/chat/ReportModal";
import { getInitials, avatarColor } from "@/lib/utils";
import {
  Send,
  SkipForward,
  Flag,
  Ban,
  ChevronLeft,
  Circle,
  Video,
} from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [input, setInput] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [showRating, setShowRating] = useState(false);

  const { messages, sendMessage, broadcastTyping, partnerTyping } = useChat(
    roomId,
    currentUser?.id || ""
  );

  // Load room and profiles
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: roomData } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (!roomData) { router.push("/main/match"); return; }
      setRoom(roomData);
      if (roomData.status === "ended") setIsEnded(true);

      const partnerId =
        roomData.user1_id === user.id ? roomData.user2_id : roomData.user1_id;

      const [{ data: me }, { data: partnerData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("profiles").select("*").eq("id", partnerId).single(),
      ]);

      setCurrentUser(me);
      setPartner(partnerData);
      setLoading(false);
    }
    load();
  }, [roomId]);

  // Subscribe to room status changes
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room-status:${roomId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.new.status === "ended") setIsEnded(true);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  const handleSend = async () => {
    if (!input.trim() || isEnded) return;
    await sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  };

  const handleSkip = async () => {
    if (!currentUser || !room) return;
    await endRoom(roomId, currentUser.id);
    await recordChatCompletion(currentUser.id);
    setShowRating(true);
  };

  const handleBlock = async () => {
    if (!currentUser || !partner) return;
    await supabase.from("blocks").upsert({
      blocker_id: currentUser.id,
      blocked_id: partner.id,
    });
    await endRoom(roomId, currentUser.id);
    router.push("/main/match");
  };

  const handleTyping = () => {
    broadcastTyping();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-algo-bg flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-2 border-algo-accent/30 border-t-algo-accent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-algo-bg flex flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-algo-border bg-algo-surface/80 backdrop-blur-md z-10">
        <button
          onClick={() => router.push("/main/match")}
          className="text-algo-text-muted hover:text-algo-text transition-colors p-1"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Partner info */}
        <div className="flex items-center gap-2.5 flex-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0"
            style={{ background: partner ? avatarColor(partner.username) : "#6c63ff" }}
          >
            {partner ? getInitials(partner.username) : "?"}
          </div>
          <div>
            <p className="font-display font-semibold text-sm">
              {partner?.username || "Stranger"}
            </p>
            <div className="flex items-center gap-1">
              <Circle className="w-1.5 h-1.5 fill-algo-accent-3 text-algo-accent-3" />
              <span className="text-xs text-algo-text-muted">
                {isEnded
                  ? "Chat ended"
                  : partnerTyping
                  ? "typing…"
                  : "online"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isEnded && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowVideo(true)}
              className="p-2 rounded-xl text-algo-text-muted hover:text-algo-accent-3 hover:bg-[#43e97b]/10 transition-all"
              title="Video call"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowReport(true)}
              className="p-2 rounded-xl text-algo-text-muted hover:text-yellow-400 hover:bg-yellow-400/10 transition-all"
              title="Report user"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={handleBlock}
              className="p-2 rounded-xl text-algo-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="Block user"
            >
              <Ban className="w-4 h-4" />
            </button>
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-algo-card border border-algo-border text-algo-text-muted hover:text-algo-text hover:border-algo-muted text-sm transition-all"
            >
              <SkipForward className="w-3.5 h-3.5" /> Skip
            </button>
          </div>
        )}
      </div>

      {/* Ended banner */}
      {isEnded && (
        <div className="bg-algo-card border-b border-algo-border px-4 py-3 text-center text-sm text-algo-text-muted">
          This chat has ended.{" "}
          <button
            onClick={() => router.push("/main/match")}
            className="text-algo-accent hover:underline"
          >
            Find a new match
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && !isEnded && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <span className="text-4xl mb-3">👋</span>
            <p className="font-display font-semibold text-algo-text mb-1">
              You matched with {partner?.username || "someone"}!
            </p>
            <p className="text-algo-text-muted text-sm">Say something. They&apos;re waiting.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender_id === currentUser?.id}
            senderUsername={
              msg.sender_id === currentUser?.id
                ? currentUser?.username
                : partner?.username
            }
          />
        ))}

        {/* Typing indicator */}
        {partnerTyping && !isEnded && (
          <div className="flex items-end gap-2 animate-fade-in">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold shrink-0"
              style={{ background: partner ? avatarColor(partner.username) : "#6c63ff" }}
            >
              {partner ? getInitials(partner.username) : "?"}
            </div>
            <div className="bg-algo-card border border-algo-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-algo-text-muted animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isEnded && (
        <div className="px-4 py-3 border-t border-algo-border bg-algo-surface/80 backdrop-blur-md">
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <input
              ref={inputRef}
              className="algo-input flex-1"
              placeholder="Say something…"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              maxLength={2000}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-11 h-11 rounded-xl bg-algo-accent flex items-center justify-center text-white transition-all hover:bg-opacity-80 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* New match button when ended */}
      {isEnded && (
        <div className="px-4 py-4 border-t border-algo-border">
          <button
            onClick={() => router.push("/main/match")}
            className="algo-btn-primary w-full py-4 flex items-center justify-center gap-2"
          >
            <SkipForward className="w-4 h-4" /> Find a new match
          </button>
        </div>
      )}

      {/* Report modal */}
      {showReport && currentUser && partner && (
        <ReportModal
          roomId={roomId}
          reportedId={partner.id}
          reporterId={currentUser.id}
          onClose={() => setShowReport(false)}
          onSuccess={() => {
            setShowReport(false);
            handleSkip();
          }}
        />
      )}

      {/* Video chat */}
      {showVideo && currentUser && partner && (
        <VideoChat
          roomId={roomId}
          userId={currentUser.id}
          partnerId={partner.id}
          partnerUsername={partner.username}
          onClose={() => setShowVideo(false)}
        />
      )}

      {/* Rate match */}
      {showRating && currentUser && partner && (
        <RateMatch
          roomId={roomId}
          raterId={currentUser.id}
          ratedId={partner.id}
          ratedUsername={partner.username}
          onDone={() => {
            setShowRating(false);
            router.push("/main/match");
          }}
        />
      )}
    </div>
  );
}