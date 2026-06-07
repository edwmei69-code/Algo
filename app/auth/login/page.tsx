"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/main/match");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-algo-bg flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-15"
          style={{
            background: "radial-gradient(ellipse, #6c63ff, #ff6584 50%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-3xl gradient-text">
            algo
          </Link>
          <p className="text-algo-text-muted mt-2 text-sm">
            Welcome back. Your people are waiting.
          </p>
        </div>

        <div className="algo-card p-8">
          <h1 className="font-display font-bold text-2xl mb-6">Log in</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-algo-text-muted font-mono mb-1.5 block">
                EMAIL
              </label>
              <input
                className="algo-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs text-algo-text-muted font-mono mb-1.5 block">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  className="algo-input pr-12"
                  type={showPw ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-algo-text-muted hover:text-algo-text"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="algo-btn-primary flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  Log in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-algo-text-muted text-sm mt-6">
            No account yet?{" "}
            <Link href="/auth/signup" className="text-algo-accent hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
