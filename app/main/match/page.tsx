"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useMatch } from "@/hooks/useMatch";
import { Interest, Profile, INTERESTS } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { User, Settings, Zap, Trophy, Flame } from "lucide-react";

export default function MatchPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setAuthLoading(false);
    }
    load();
  }, []);

  const { status, roomId, waitTime, startSearching, stopSearching } = useMatch(
    profile?.id || "",
    (profile?.interests as Interest[]) || []
  );

  // Navigate when matched
  useEffect(() => {
    if (status === "matched" && roomId) {
      router.push(`/main/chat/${roomId}`);
    }
  }, [status, roomId, router]);

  const formatWait = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-algo-bg flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-2 border-algo-accent/30 border-t-algo-accent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-algo-bg flex flex-col">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-10"
          style={{
            background: "radial-gradient(ellipse, #6c63ff, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Topbar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-algo-border">
        <span className="font-display font-bold text-xl gradient-text">algo</span>
        <div className="flex items-center gap-2">
          <Link
            href="/main/leaderboard"
            className="w-9 h-9 rounded-xl border border-[#1e1e30] flex items-center justify-center text-yellow-400 hover:border-yellow-500/50 hover:bg-yellow-400/10 transition-colors"
          >
            <Trophy className="w-4 h-4" />
          </Link>
          <Link
            href="/main/profile"
            className="w-9 h-9 rounded-xl border border-algo-border flex items-center justify-center text-algo-text-muted hover:text-algo-text hover:border-algo-muted transition-colors"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* Status orb */}
        <div className="relative mb-10">
          <div
            className={cn(
              "w-40 h-40 rounded-full border-2 flex items-center justify-center transition-all duration-500",
              status === "idle" && "border-algo-border bg-algo-card",
              status === "searching" &&
                "border-algo-accent bg-algo-accent/10 animate-pulse-glow",
              status === "error" && "border-red-500/50 bg-red-500/10"
            )}
          >
            {status === "idle" && (
              <span className="text-5xl">👋</span>
            )}
            {status === "searching" && (
              <div className="flex flex-col items-center gap-2">
                <span className="animate-spin w-8 h-8 border-2 border-algo-accent/30 border-t-algo-accent rounded-full" />
                <span className="font-mono text-sm text-algo-accent">{formatWait(waitTime)}</span>
              </div>
            )}
            {status === "error" && <span className="text-5xl">😕</span>}
          </div>

          {status === "searching" && (
            <>
              <div className="absolute inset-0 rounded-full border border-algo-accent/20 animate-ping scale-125" />
              <div className="absolute inset-0 rounded-full border border-algo-accent/10 animate-ping scale-150" style={{ animationDelay: "0.5s" }} />
            </>
          )}
        </div>

        {/* Text */}
        <h1 className="font-display font-bold text-3xl mb-3">
          {status === "idle" && "Ready to meet someone?"}
          {status === "searching" && "Finding your match…"}
          {status === "error" && "Something went wrong"}
        </h1>

        <p className="text-algo-text-muted mb-8 max-w-sm">
          {status === "idle" &&
            "We'll match you with someone who shares your interests. Could be anyone."}
          {status === "searching" &&
            "Scanning for people with similar interests. Hold tight."}
          {status === "error" && "Try again in a moment."}
        </p>

        {/* CTA */}
        {status === "idle" && (
          <button
            onClick={startSearching}
            className="algo-btn-primary flex items-center gap-2 text-lg px-10 py-4"
          >
            <Zap className="w-5 h-5" /> Start Chatting
          </button>
        )}
        {status === "searching" && (
          <button onClick={stopSearching} className="algo-btn-ghost">
            Cancel search
          </button>
        )}
        {status === "error" && (
          <button onClick={startSearching} className="algo-btn-primary">
            Try again
          </button>
        )}

        {/* Interests preview */}
        {profile?.interests && profile.interests.length > 0 && (
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {(profile.interests as Interest[]).map((id) => {
              const info = INTERESTS.find((i) => i.id === id);
              return info ? (
                <span
                  key={id}
                  className="bg-algo-card border border-algo-border rounded-full px-3 py-1 text-xs text-algo-text-muted"
                >
                  {info.emoji} {info.label}
                </span>
              ) : null;
            })}
          </div>
        )}

        <Link
          href="/main/interests"
          className="mt-4 text-xs text-algo-text-muted hover:text-algo-text underline underline-offset-4 transition-colors"
        >
          <Settings className="w-3 h-3 inline mr-1" />
          Edit interests
        </Link>
      </div>

      {/* Premium banner */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-md mx-auto algo-card p-4 flex items-center gap-4 opacity-60 cursor-not-allowed">
          <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
          <div>
            <p className="text-xs font-display font-semibold text-algo-text">
              Algo Premium — Coming Soon
            </p>
            <p className="text-xs text-algo-text-muted">
              Advanced filters, boosts, and reconnect with past matches.
            </p>
          </div>
          <span className="ml-auto text-xs bg-algo-surface border border-algo-border px-2 py-1 rounded-lg text-algo-text-muted shrink-0">
            Soon
          </span>
        </div>
      </div>
    </div>
  );
}