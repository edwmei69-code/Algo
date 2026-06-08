"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChat } from "@/hooks/useChat";
import { useWebRTC } from "@/hooks/useWebRTC";
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
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [showRating, setShowRating] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);

  const { messages, sendMessage, broadcastTyping, partnerTyping } = useChat(
    roomId,
    currentUser?.id || ""
  );

  const {
    status: videoStatus,
    localVideoRef,
    remoteVideoRef,
    isMuted,
    isCameraOff,
    startCall,
    endCall,
    toggleMute,
    toggleCamera,
  } = useWebRTC(roomId, currentUser?.id || "", partner?.id || "");

  // Load room and profiles
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: roomData } = await supabase
        .from("rooms").select("*").eq("id", roomId).single();

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

  // Auto-start video when both users are loaded
  useEffect(() => {
    if (currentUser && partner && !isEnded) {
      startCall();
    }
  }, [currentUser?.id, partner?.id]);

  // Subscribe to room status changes
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room-status:${roomId}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => { if (payload.new.status === "ended") setIsEnded(true); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  // Auto-scroll chat
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
    endCall();
    await endRoom(roomId, currentUser.id);
    await recordChatCompletion(currentUser.id);
    setShowRating(true);
  };

  const handleBlock = async () => {
    if (!currentUser || !partner) return;
    endCall();
    await supabase.from("blocks").upsert({
      blocker_id: currentUser.id,
      blocked_id: partner.id,
    });
    await endRoom(roomId, currentUser.id);
    router.push("/main/match");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#080810] flex overflow-hidden">

      {/* ── VIDEO AREA (main) ── */}
      <div className="relative flex-1 bg-black">

        {/* Remote video */}
        {videoStatus === "connected" ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#080810]">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-2xl"
              style={{ background: partner ? avatarColor(partner.username) : "#6c63ff" }}
            >
              {partner ? getInitials(partner.username) : "?"}
            </div>
            <p className="text-white font-semibold text-lg">
              {videoStatus === "calling" ? `Calling ${partner?.username}…` : `Connecting to ${partner?.username}…`}
            </p>
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-[#6c63ff] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Local video PiP */}
        <div className="absolute bottom-24 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isCameraOff && (
            <div className="absolute inset-0 bg-[#13131f] flex items-center justify-center">
              <VideoOff className="w-5 h-5 text-[#7070a0]" />
            </div>
          )}
        </div>

        {/* Partner name tag */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-[#43e97b] animate-pulse" />
          <span className="text-white text-sm font-semibold">{partner?.username || "Stranger"}</span>
        </div>

        {/* Controls bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <button
            onClick={toggleMute}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              isMuted ? "bg-red-500 text-white" : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            )}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleSkip}
            className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-lg"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          <button
            onClick={toggleCamera}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              isCameraOff ? "bg-red-500 text-white" : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            )}
          >
            {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Report/block */}
          <button
            onClick={() => setShowReport(true)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-yellow-400 transition-all"
          >
            <Flag className="w-4 h-4" />
          </button>

          <button
            onClick={handleBlock}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-red-400 transition-all"
          >
            <Ban className="w-4 h-4" />
          </button>
        </div>

        {/* Chat toggle button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="absolute top-1/2 right-0 -translate-y-1/2 w-6 h-12 bg-[#13131f] border border-[#1e1e30] rounded-l-xl flex items-center justify-center text-[#7070a0] hover:text-white transition-colors z-10"
        >
          {chatOpen ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* ── CHAT PANEL (side) ── */}
      <div className={cn(
        "flex flex-col bg-[#0f0f1a] border-l border-[#1e1e30] transition-all duration-300",
        chatOpen ? "w-72" : "w-0 overflow-hidden"
      )}>
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-[#1e1e30] flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold text-white">Chat</span>
          {isEnded && (
            <span className="text-xs text-red-400">Ended</span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
          {messages.length === 0 && (
            <p className="text-[#7070a0] text-xs text-center mt-4">
              Say something while you chat 👋
            </p>
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
          {partnerTyping && (
            <div className="flex gap-1 px-2">
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#7070a0] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!isEnded && (
          <div className="px-3 py-3 border-t border-[#1e1e30] flex gap-2 shrink-0">
            <input
              ref={inputRef}
              className="flex-1 bg-[#13131f] border border-[#1e1e30] rounded-xl px-3 py-2 text-[#e8e8f0] text-sm placeholder:text-[#7070a0] focus:outline-none focus:border-[#6c63ff] transition-colors"
              placeholder="Type…"
              value={input}
              onChange={(e) => { setInput(e.target.value); broadcastTyping(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              maxLength={2000}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-[#6c63ff] flex items-center justify-center text-white disabled:opacity-40 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* New match button */}
        {isEnded && (
          <div className="px-3 py-3 border-t border-[#1e1e30] shrink-0">
            <button
              onClick={() => router.push("/main/match")}
              className="w-full py-2.5 rounded-xl bg-[#6c63ff] text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <SkipForward className="w-3.5 h-3.5" /> New match
            </button>
          </div>
        )}
      </div>

      {/* Report modal */}
      {showReport && currentUser && partner && (
        <ReportModal
          roomId={roomId}
          reportedId={partner.id}
          reporterId={currentUser.id}
          onClose={() => setShowReport(false)}
          onSuccess={() => { setShowReport(false); handleSkip(); }}
        />
      )}

      {/* Rate match */}
      {showRating && currentUser && partner && (
        <RateMatch
          roomId={roomId}
          raterId={currentUser.id}
          ratedId={partner.id}
          ratedUsername={partner.username}
          onDone={() => { setShowRating(false); router.push("/main/match"); }}
        />
      )}
    </div>
  );
}