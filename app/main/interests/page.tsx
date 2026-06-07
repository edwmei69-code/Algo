"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { INTERESTS, Interest } from "@/types";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InterestsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (id: Interest) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selected.length < 1) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    await supabase
      .from("profiles")
      .update({ interests: selected })
      .eq("id", user.id);

    router.push("/main/match");
  };

  return (
    <div className="min-h-screen bg-algo-bg px-4 py-16 flex flex-col items-center">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] opacity-10"
          style={{
            background: "radial-gradient(ellipse, #43e97b, #6c63ff 50%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <span className="font-display font-bold text-3xl gradient-text">algo</span>
          <h1 className="font-display font-bold text-3xl mt-4 mb-2">
            What's your world?
          </h1>
          <p className="text-algo-text-muted">
            Pick at least 1 interest. We'll match you with people who get it.
          </p>
        </div>

        {/* Interest grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {INTERESTS.map(({ id, label, emoji }, i) => {
            const isSelected = selected.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={cn(
                  "algo-card p-4 flex items-center gap-3 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                  "animate-fade-up",
                  isSelected
                    ? "border-algo-accent bg-algo-accent/10 shadow-[0_0_20px_rgba(108,99,255,0.15)]"
                    : "hover:border-algo-muted"
                )}
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <span className="text-2xl">{emoji}</span>
                <span
                  className={cn(
                    "font-display font-semibold text-sm",
                    isSelected ? "text-algo-accent" : "text-algo-text"
                  )}
                >
                  {label}
                </span>
                {isSelected && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-algo-accent" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selection count */}
        <div className="text-center mb-6">
          <span className="text-algo-text-muted text-sm">
            {selected.length === 0
              ? "Select at least 1 to continue"
              : `${selected.length} selected — nice picks`}
          </span>
        </div>

        {/* Continue */}
        <button
          onClick={handleContinue}
          disabled={selected.length === 0 || loading}
          className="algo-btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
        >
          {loading ? (
            <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>
              Find my matches <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-algo-text-muted text-xs mt-4">
          You can update your interests anytime in your profile.
        </p>
      </div>
    </div>
  );
}
