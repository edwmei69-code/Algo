"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
 
type CallStatus = "idle" | "calling" | "receiving" | "connected" | "ended";
 
export function useWebRTC(roomId: string, userId: string, partnerId: string) {
  const supabase = createClient();
  const [status, setStatus] = useState<CallStatus>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
 
  const peerRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const channelRef = useRef<any>(null);
 
  // Setup signalling channel
  useEffect(() => {
    if (!roomId || !userId) return;
 
    const channel = supabase.channel(`webrtc:${roomId}`)
      .on("broadcast", { event: "signal" }, ({ payload }) => {
        if (payload.to !== userId) return;
 
        if (payload.type === "offer") {
          setStatus("receiving");
          handleOffer(payload.signal);
        } else if (payload.type === "answer" && peerRef.current) {
          peerRef.current.signal(payload.signal);
        } else if (payload.type === "ice" && peerRef.current) {
          peerRef.current.signal(payload.signal);
        } else if (payload.type === "end") {
          endCall();
        }
      })
      .subscribe();
 
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [roomId, userId]);
 
  const sendSignal = useCallback((type: string, signal: any) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "signal",
      payload: { type, signal, from: userId, to: partnerId },
    });
  }, [userId, partnerId]);
 
  const getMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };
 
  const startCall = async () => {
    try {
      const stream = await getMedia();
      const Peer = (await import("simple-peer")).default;
 
      const peer = new Peer({ initiator: true, trickle: true, stream });
 
      peer.on("signal", (signal: any) => {
        sendSignal("offer", signal);
      });
 
      peer.on("stream", (remote: MediaStream) => {
        setRemoteStream(remote);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
        setStatus("connected");
      });
 
      peer.on("error", () => endCall());
      peer.on("close", () => endCall());
 
      peerRef.current = peer;
      setStatus("calling");
    } catch (err) {
      console.error("Camera/mic access denied:", err);
    }
  };
 
  const handleOffer = async (signal: any) => {
    try {
      const stream = await getMedia();
      const Peer = (await import("simple-peer")).default;
 
      const peer = new Peer({ initiator: false, trickle: true, stream });
 
      peer.on("signal", (s: any) => {
        sendSignal("answer", s);
      });
 
      peer.on("stream", (remote: MediaStream) => {
        setRemoteStream(remote);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
        setStatus("connected");
      });
 
      peer.on("error", () => endCall());
      peer.on("close", () => endCall());
 
      peer.signal(signal);
      peerRef.current = peer;
    } catch (err) {
      console.error("Camera/mic access denied:", err);
    }
  };
 
  const acceptCall = () => {
    // Already handled in handleOffer — just update UI
    setStatus("connected");
  };
 
  const endCall = useCallback(() => {
    peerRef.current?.destroy();
    peerRef.current = null;
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setStatus("ended");
    sendSignal("end", {});
    setTimeout(() => setStatus("idle"), 1000);
  }, [localStream, sendSignal]);
 
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = isMuted));
      setIsMuted(!isMuted);
    }
  };
 
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = isCameraOff));
      setIsCameraOff(!isCameraOff);
    }
  };
 
  return {
    status,
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    isMuted,
    isCameraOff,
    startCall,
    acceptCall,
    endCall,
    toggleMute,
    toggleCamera,
  };
}