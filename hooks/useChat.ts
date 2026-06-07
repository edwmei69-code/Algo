"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/types";

export function useChat(roomId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const supabase = createClient();
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing messages
  useEffect(() => {
    if (!roomId) return;

    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      setMessages(data || []);
      setLoading(false);
    }

    loadMessages();

    // Subscribe to new messages in real time
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      // Presence for typing indicators
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.user_id !== userId) {
          setPartnerTyping(true);
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setPartnerTyping(false), 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    await supabase
      .from("messages")
      .insert({ room_id: roomId, sender_id: userId, content: content.trim() });
  };

  const broadcastTyping = async () => {
    await supabase.channel(`room:${roomId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: userId },
    });
  };

  return { messages, loading, sendMessage, broadcastTyping, partnerTyping };
}
