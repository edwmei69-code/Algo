"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile, INTERESTS, Interest } from "@/types";
import { avatarColor, getInitials, cn } from "@/lib/utils";
import { ArrowLeft, Save, LogOut, Zap, Edit3, Flame, Trophy } from "lucide-react";
import Link from "next/link";
import { BADGES, getBadge } from "@/lib/badges";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: "", age: "", country: "", bio: "" });
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [saved, setSaved] = useState(false);
  const [streak, setStreak] = useState(0);
  const [userBadges, setUserBadges] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();

      setProfile(data);
      if (data) {
        setForm({
          username: data.username || "",
          age: data.age?.toString() || "",
          country: data.country || "",
          bio: data.bio || "",
        });
        setSelectedInterests(data.interests || []);
      }

      // Load streak
      const { data: streakData } = await supabase
        .from("streaks")
        .select("current_streak")
        .eq("user_id", user.id)
        .single();
      if (streakData) setStreak(streakData.current_streak);

      // Load badges
      const { data: badgeData } = await supabase
        .from("badges")
        .select("badge_type")
        .eq("user_id", user.id);
      if (badgeData) setUserBadges(badgeData.map((b: any) => b.badge_type));

      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    await supabase.from("profiles").update({
      username: form.username,
      age: parseInt(form.age) || null,
      country: form.country,
      bio: form.bio,
      interests: selectedInterests,
    }).eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const toggleInterest = (id: Interest) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-algo-bg flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-2 border-algo-accent/30 border-t-algo-accent rounded-full" />
      </div>
    );
  }

  const color = profile ? avatarColor(profile.username) : "#6c63ff";
  const initials = profile ? getInitials(profile.username) : "?";

  return (
    <div className="min-h-screen bg-algo-bg">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-10"
          style={{
            background: `radial-gradient(ellipse, ${color}, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-algo-border">
        <Link
          href="/main/match"
          className="text-algo-text-muted hover:text-algo-text transition-colors flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <span className="font-display font-bold gradient-text">algo</span>
        <button
          onClick={handleSignOut}
          className="text-algo-text-muted hover:text-red-400 transition-colors flex items-center gap-1.5 text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center font-display font-bold text-2xl mb-3 shadow-lg"
            style={{ background: color }}
          >
            {initials}
          </div>
          <h1 className="font-display font-bold text-2xl">{profile?.username}</h1>
          <p className="text-algo-text-muted text-sm">
            {profile?.age && `${profile.age} · `}
            {profile?.country || "Earth"}
          </p>
          {profile?.is_premium && (
            <span className="mt-2 inline-flex items-center gap-1 bg-yellow-400/10 text-yellow-400 text-xs px-2.5 py-1 rounded-full font-mono">
              <Zap className="w-3 h-3" /> PREMIUM
            </span>
          )}

          {/* Streak */}
          {streak > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-semibold text-sm">{streak} day streak</span>
            </div>
          )}
        </div>

        {/* Edit toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-1.5 text-sm text-algo-text-muted hover:text-algo-text transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {editMode ? "Cancel edit" : "Edit profile"}
          </button>
        </div>

        {/* Profile card */}
        <div className="algo-card p-6 mb-5">
          <h2 className="font-display font-semibold text-sm text-algo-text-muted mb-4 tracking-wider">
            PROFILE INFO
          </h2>

          {editMode ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-algo-text-muted font-mono mb-1 block">USERNAME</label>
                <input
                  className="algo-input"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-algo-text-muted font-mono mb-1 block">AGE</label>
                  <input
                    className="algo-input"
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-algo-text-muted font-mono mb-1 block">COUNTRY</label>
                  <input
                    className="algo-input"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-algo-text-muted font-mono mb-1 block">BIO</label>
                <textarea
                  className="algo-input resize-none h-20"
                  placeholder="Tell people a bit about yourself…"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  maxLength={160}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[
                { label: "Username", value: profile?.username },
                { label: "Age", value: profile?.age || "—" },
                { label: "Country", value: profile?.country || "—" },
                { label: "Bio", value: profile?.bio || "No bio yet" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4">
                  <span className="text-xs font-mono text-algo-text-muted">{label.toUpperCase()}</span>
                  <span className="text-sm text-algo-text text-right max-w-[60%]">{value?.toString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interests */}
        <div className="algo-card p-6 mb-5">
          <h2 className="font-display font-semibold text-sm text-algo-text-muted mb-4 tracking-wider">
            MY INTERESTS
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {INTERESTS.map(({ id, label, emoji }) => {
              const isSelected = selectedInterests.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => editMode && toggleInterest(id)}
                  disabled={!editMode}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition-all",
                    isSelected
                      ? "border-algo-accent bg-algo-accent/10 text-algo-accent"
                      : "border-algo-border text-algo-text-muted",
                    editMode && !isSelected && "hover:border-algo-muted cursor-pointer",
                    !editMode && "cursor-default"
                  )}
                >
                  <span>{emoji}</span>
                  <span className="font-display font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
          {!editMode && selectedInterests.length === 0 && (
            <p className="text-algo-text-muted text-sm text-center mt-2">
              No interests selected yet.
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="algo-card p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm text-algo-text-muted tracking-wider">
              MY BADGES
            </h2>
            <Link href="/main/leaderboard" className="text-xs text-[#6c63ff] hover:underline flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Leaderboard
            </Link>
          </div>
          {userBadges.length === 0 ? (
            <p className="text-algo-text-muted text-sm text-center py-4">
              No badges yet — start chatting to earn them!
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {userBadges.map((badgeType) => {
                const badge = getBadge(badgeType as any);
                return (
                  <div key={badgeType} className="flex flex-col items-center gap-1 bg-algo-surface border border-algo-border rounded-xl p-3 text-center">
                    <span className="text-2xl">{badge.emoji}</span>
                    <span className="text-xs font-semibold text-algo-text">{badge.label}</span>
                    <span className="text-[10px] text-algo-text-muted leading-tight">{badge.desc}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Premium section */}
        <div
          className="algo-card p-6 mb-6 opacity-70 cursor-not-allowed"
          style={{
            background:
              "linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(255,101,132,0.04) 100%)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h2 className="font-display font-semibold text-sm tracking-wider">
              ALGO PREMIUM
            </h2>
            <span className="text-xs font-mono bg-algo-surface border border-algo-border px-2 py-0.5 rounded-md text-algo-text-muted">
              SOON
            </span>
          </div>
          <ul className="text-algo-text-muted text-xs flex flex-col gap-1.5">
            {[
              "Advanced interest filters",
              "Priority matching & boosts",
              "Reconnect with past matches",
              "See who's online near you",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-algo-muted" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Save button */}
        {editMode && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="algo-btn-primary w-full flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : saved ? (
              "✓ Saved!"
            ) : (
              <>
                <Save className="w-4 h-4" /> Save changes
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}