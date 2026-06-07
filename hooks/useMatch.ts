"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { findMatch, joinQueue, leaveQueue } from "@/lib/matching";
import { Interest } from "@/types";

type MatchStatus = "idle" | "searching" | "matched" | "error";

export function useMatch(userId: string, interests: Interest[]) {
  const [status, setStatus] = useState<MatchStatus>("idle");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [waitTime, setWaitTime] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = createClient();

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startSearching = useCallback(async () => {
    if (!userId) return;
    setStatus("searching");
    setWaitTime(0);
    setRoomId(null);

    await joinQueue(userId, interests);

    // Increment wait timer
    timerRef.current = setInterval(() => {
      setWaitTime((t) => t + 1);
    }, 1000);

    // Poll for a match every 2 seconds
    pollRef.current = setInterval(async () => {
      try {
        const id = await findMatch(userId, interests);
        if (id) {
          stopPolling();
          setRoomId(id);
          setStatus("matched");
        }
      } catch {
        stopPolling();
        setStatus("error");
      }
    }, 2000);
  }, [userId, interests, stopPolling]);

  const stopSearching = useCallback(async () => {
    stopPolling();
    await leaveQueue(userId);
    setStatus("idle");
    setWaitTime(0);
  }, [userId, stopPolling]);

  // Also listen for being matched by someone else
  useEffect(() => {
    if (!userId || status !== "searching") return;

    const channel = supabase
      .channel(`match:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rooms",
          filter: `user2_id=eq.${userId}`,
        },
        (payload) => {
          stopPolling();
          setRoomId(payload.new.id);
          setStatus("matched");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, status, stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  return { status, roomId, waitTime, startSearching, stopSearching };
}
