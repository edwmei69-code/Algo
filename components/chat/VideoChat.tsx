"use client";
import { useEffect } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Phone, X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoChatProps {
  roomId: string;
  userId: string;
  partnerId: string;
  partnerUsername: string;
  onClose: () => void;
}

export function VideoChat({
  roomId,
  userId,
  partnerId,
  partnerUsername,
  onClose,
}: VideoChatProps) {
  const {
    status,
    localVideoRef,
    remoteVideoRef,
    isMuted,
    isCameraOff,
    startCall,
    acceptCall,
    endCall,
    toggleMute,
    toggleCamera,
  } = useWebRTC(roomId, userId, partnerId);
  useEffect(() => {
  startCall();
}, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Remote video (full screen) */}
      <div className="flex-1 relative bg-[#080810]">
        {status === "connected" ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            {status === "idle" && (
              <>
                <div className="w-20 h-20 rounded-full bg-[#13131f] border border-[#1e1e30] flex items-center justify-center text-3xl">
                  📹
                </div>
                <p className="text-[#e8e8f0] font-semibold text-lg">
                  Start a video call with {partnerUsername}
                </p>
                <button
                  onClick={startCall}
                  className="flex items-center gap-2 bg-[#43e97b] text-black font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all"
                >
                  <Phone className="w-4 h-4" /> Start Video Call
                </button>
              </>
            )}

            {status === "calling" && (
              <>
                <div className="w-20 h-20 rounded-full border-2 border-[#6c63ff] flex items-center justify-center animate-pulse">
                  <Phone className="w-8 h-8 text-[#6c63ff]" />
                </div>
                <p className="text-[#e8e8f0] font-semibold">
                  Calling {partnerUsername}…
                </p>
                <button
                  onClick={endCall}
                  className="flex items-center gap-2 bg-red-500 text-white font-semibold px-6 py-3 rounded-xl"
                >
                  <PhoneOff className="w-4 h-4" /> Cancel
                </button>
              </>
            )}

            {status === "receiving" && (
              <>
                <div className="w-20 h-20 rounded-full border-2 border-[#43e97b] flex items-center justify-center animate-bounce">
                  <Phone className="w-8 h-8 text-[#43e97b]" />
                </div>
                <p className="text-[#e8e8f0] font-semibold text-lg">
                  {partnerUsername} is calling…
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={acceptCall}
                    className="flex items-center gap-2 bg-[#43e97b] text-black font-semibold px-6 py-3 rounded-xl"
                  >
                    <Phone className="w-4 h-4" /> Accept
                  </button>
                  <button
                    onClick={endCall}
                    className="flex items-center gap-2 bg-red-500 text-white font-semibold px-6 py-3 rounded-xl"
                  >
                    <PhoneOff className="w-4 h-4" /> Decline
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Local video (picture-in-picture) */}
        {(status === "connected" || status === "calling") && (
          <div className="absolute bottom-24 right-4 w-32 h-44 rounded-xl overflow-hidden border-2 border-[#1e1e30] shadow-xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isCameraOff && (
              <div className="absolute inset-0 bg-[#13131f] flex items-center justify-center">
                <VideoOff className="w-6 h-6 text-[#7070a0]" />
              </div>
            )}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Controls */}
      {status === "connected" && (
        <div className="bg-[#0f0f1a] border-t border-[#1e1e30] px-6 py-4 flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              isMuted
                ? "bg-red-500/20 border border-red-500/50 text-red-400"
                : "bg-[#13131f] border border-[#1e1e30] text-[#e8e8f0] hover:border-[#3a3a55]"
            )}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-lg"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          <button
            onClick={toggleCamera}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              isCameraOff
                ? "bg-red-500/20 border border-red-500/50 text-red-400"
                : "bg-[#13131f] border border-[#1e1e30] text-[#e8e8f0] hover:border-[#3a3a55]"
            )}
          >
            {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  );
}