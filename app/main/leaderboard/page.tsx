"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flame, Trophy, Star, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { avatarColor, getInitials } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  username: string;
  country: string;
  total_chats: number;
  current_streak: number;
  longest_streak: number;
  avg_rating: number;
  badge_count: number;
}

interface CountryStat {
  country: string;
  user_count: number;
  total_chats: number;
}

type Tab = "chats" | "streaks" | "rated" | "countries";

export default function LeaderboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("chats");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: lb } = await supabase
        .from("leaderboard")
        .select("*")
        .order("total_chats", { ascending: false })
        .limit(50);

      const { data: cs } = await supabase
        .from("country_stats")
        .select("*")
        .limit(20);

      setEntries(lb || []);
      setCountries(cs || []);
      setLoading(false);
    }
    load();
  }, []);

  const sorted = [...entries].sort((a, b) => {
    if (tab === "chats") return b.total_chats - a.total_chats;
    if (tab === "streaks") return b.current_streak - a.current_streak;
    if (tab === "rated") return b.avg_rating - a.avg_rating;
    return 0;
  });

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "chats", label: "Most Chats", icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { id: "streaks", label: "Streaks", icon: <Flame className="w-3.5 h-3.5" /> },
    { id: "rated", label: "Top Rated", icon: <Star className="w-3.5 h-3.5" /> },
    { id: "countries", label: "Countries", icon: <Trophy className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#080810]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-10"
          style={{ background: "radial-gradient(ellipse, #f59e0b, transparent 70%)", filter: "blur(80px)" }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-6 py-4 border-b border-[#1e1e30]">
        <Link href="/main/match" className="text-[#7070a0] hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold text-white text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" /> Leaderboard
          </h1>
          <p className="text-[#7070a0] text-xs">Weekly rankings reset every Monday</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 flex gap-2 px-6 py-4 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0",
              tab === t.id
                ? "bg-[#6c63ff] text-white"
                : "bg-[#13131f] border border-[#1e1e30] text-[#7070a0] hover:text-white"
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pb-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="animate-spin w-8 h-8 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full" />
          </div>
        ) : tab === "countries" ? (
          <div className="flex flex-col gap-3">
            {countries.map((c, i) => (
              <div key={c.country} className="bg-[#13131f] border border-[#1e1e30] rounded-xl p-4 flex items-center gap-4">
                <span className="font-mono text-[#7070a0] text-sm w-6">#{i + 1}</span>
                <span className="text-2xl">{countryFlag(c.country)}</span>
                <div className="flex-1">
                  <p className="font-semibold text-white">{c.country}</p>
                  <p className="text-xs text-[#7070a0]">{c.user_count} users</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{c.total_chats}</p>
                  <p className="text-xs text-[#7070a0]">chats</p>
                </div>
              </div>
            ))}
            {countries.length === 0 && (
              <p className="text-center text-[#7070a0] py-16">No country data yet.</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Top 3 podium */}
            {sorted.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[sorted[1], sorted[0], sorted[2]].map((entry, i) => {
                  if (!entry) return <div key={i} />;
                  const pos = i === 1 ? 1 : i === 0 ? 2 : 3;
                  const medals = ["🥈", "🥇", "🥉"];
                  return (
                    <div key={entry.id} className={cn(
                      "bg-[#13131f] border rounded-2xl p-3 text-center flex flex-col items-center gap-2",
                      pos === 1 ? "border-yellow-500/50" : "border-[#1e1e30]",
                      pos === 1 ? "mt-0" : "mt-4"
                    )}>
                      <span className="text-xl">{medals[i]}</span>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ background: avatarColor(entry.username) }}>
                        {getInitials(entry.username)}
                      </div>
                      <p className="text-xs font-semibold text-white truncate w-full text-center">{entry.username}</p>
                      <p className="text-xs text-[#7070a0]">
                        {tab === "chats" && `${entry.total_chats} chats`}
                        {tab === "streaks" && `${entry.current_streak} 🔥`}
                        {tab === "rated" && `${Number(entry.avg_rating).toFixed(1)} ⭐`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rest of list */}
            {sorted.slice(3).map((entry, i) => (
              <div key={entry.id} className="bg-[#13131f] border border-[#1e1e30] rounded-xl p-4 flex items-center gap-3">
                <span className="font-mono text-[#7070a0] text-sm w-6">#{i + 4}</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ background: avatarColor(entry.username) }}>
                  {getInitials(entry.username)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{entry.username}</p>
                  <p className="text-xs text-[#7070a0]">{entry.country || "Unknown"}</p>
                </div>
                <div className="text-right">
                  {tab === "chats" && <><p className="font-bold text-white">{entry.total_chats}</p><p className="text-xs text-[#7070a0]">chats</p></>}
                  {tab === "streaks" && <><p className="font-bold text-white">{entry.current_streak} 🔥</p><p className="text-xs text-[#7070a0]">day streak</p></>}
                  {tab === "rated" && <><p className="font-bold text-white">{Number(entry.avg_rating).toFixed(1)} ⭐</p><p className="text-xs text-[#7070a0]">avg rating</p></>}
                </div>
              </div>
            ))}

            {sorted.length === 0 && (
              <p className="text-center text-[#7070a0] py-16">No data yet — start chatting!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function countryFlag(country: string): string {
  const flags: Record<string, string> = {
    "UK": "🇬🇧", "US": "🇺🇸", "USA": "🇺🇸", "Canada": "🇨🇦",
    "Australia": "🇦🇺", "Germany": "🇩🇪", "France": "🇫🇷",
    "Spain": "🇪🇸", "Italy": "🇮🇹", "Brazil": "🇧🇷",
    "India": "🇮🇳", "Japan": "🇯🇵", "Nigeria": "🇳🇬",
    "South Africa": "🇿🇦", "Mexico": "🇲🇽", "Netherlands": "🇳🇱",
  };
  return flags[country] || "🌍";
}