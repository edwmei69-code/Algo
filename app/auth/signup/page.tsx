"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
    country: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (parseInt(form.age) < 13) {
      setError("You must be at least 13 years old.");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { username: form.username },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Update profile with additional info
      await supabase.from("profiles").upsert({
        id: data.user.id,
        username: form.username,
        age: parseInt(form.age) || null,
        country: form.country || null,
      });

      router.push("/main/interests");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-algo-bg flex items-center justify-center px-4 py-16">
      {/* Background glow */}
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
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-3xl gradient-text">
            algo
          </Link>
          <p className="text-algo-text-muted mt-2 text-sm">
            Create your account and find your people.
          </p>
        </div>

        <div className="algo-card p-8">
          <h1 className="font-display font-bold text-2xl mb-6">Sign up</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-algo-text-muted font-mono mb-1.5 block">
                USERNAME
              </label>
              <input
                className="algo-input"
                placeholder="e.g. streetwear_guy"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                minLength={3}
                maxLength={24}
                pattern="[a-zA-Z0-9_]+"
              />
              <p className="text-xs text-algo-text-muted mt-1">
                Letters, numbers, underscores only
              </p>
            </div>

            <div>
              <label className="text-xs text-algo-text-muted font-mono mb-1.5 block">
                EMAIL
              </label>
              <input
                className="algo-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-algo-text-muted font-mono mb-1.5 block">
                  AGE
                </label>
                <input
                  className="algo-input"
                  type="number"
                  placeholder="18"
                  min="13"
                  max="100"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-algo-text-muted font-mono mb-1.5 block">
                  COUNTRY
                </label>
                <input
                  className="algo-input"
                  placeholder="UK"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
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
                  Create account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-algo-text-muted text-sm mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-algo-accent hover:underline">
              Log in
            </Link>
          </p>

          <p className="text-center text-algo-text-muted text-xs mt-4">
            By signing up, you agree to our{" "}
            <span className="text-algo-text-muted underline cursor-pointer">Terms</span>{" "}
            and{" "}
            <span className="text-algo-text-muted underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
