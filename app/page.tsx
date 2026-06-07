"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Users } from "lucide-react";

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Instant matches",
    desc: "Our algorithm pairs you in seconds based on what you actually care about.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Interest-based",
    desc: "Gym, gaming, music, finance — meet people who get your world.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Safe by design",
    desc: "Report and block tools built in. Your comfort comes first.",
  },
];

const TICKER = [
  "🎮 gaming",
  "💪 gym",
  "📈 investing",
  "🎵 music",
  "⚽ football",
  "📚 studying",
  "💘 dating",
  "😂 memes",
  "🎓 university",
  "💼 business",
  "📺 streaming",
  "👗 fashion",
];

function OnlineCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Start at a realistic number
    setCount(Math.floor(Math.random() * 300) + 847);

    // Randomly fluctuate every few seconds
    const interval = setInterval(() => {
      setCount((prev) => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(800, prev + change);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 bg-[#13131f] border border-[#1e1e30] rounded-full px-4 py-2 text-sm">
      <span className="w-2 h-2 rounded-full bg-[#43e97b] animate-pulse" />
      <span className="text-[#e8e8f0] font-semibold">{count.toLocaleString()}</span>
      <span className="text-[#7070a0]">people online now</span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-algo-bg overflow-x-hidden noise-overlay">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse, #6c63ff 0%, #ff6584 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="font-display font-bold text-2xl tracking-tight">
          <span className="gradient-text">algo</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="algo-btn-ghost text-sm py-2 px-5">
            Log in
          </Link>
          <Link href="/auth/signup" className="algo-btn-primary text-sm py-2 px-5">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center pt-20 pb-16 px-4">
        <div className="flex flex-col items-center gap-3 mb-8 animate-fade-in">
  <div className="inline-flex items-center gap-2 bg-algo-card border border-algo-border rounded-full px-4 py-1.5 text-xs text-algo-text-muted">
    <span className="w-1.5 h-1.5 rounded-full bg-algo-accent-3 animate-pulse" />
    Now live — join the waitlist or dive straight in
  </div>
  <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/40 rounded-full px-5 py-2 text-sm font-semibold text-yellow-300 animate-pulse">
    🏆 $1,000 PRIZE — Most viewed video chat wins. Start chatting now.
  </div>
    <OnlineCounter />
</div>

        <h1
          className="font-display font-bold text-5xl sm:text-7xl leading-[1.05] tracking-tight mb-6 animate-fade-up"
          style={{ animationDelay: "0.1s", opacity: 0 }}
        >
          Meet the people your
          <br />
          <span className="gradient-text">algorithm</span> would have
          <br />
          shown you.
        </h1>

        <p
          className="text-algo-text-muted text-lg max-w-xl mb-10 animate-fade-up"
          style={{ animationDelay: "0.2s", opacity: 0 }}
        >
          Algo matches you with strangers who share your exact interests, taste,
          and online culture. No profiles to browse. Just real conversations.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-3 animate-fade-up"
          style={{ animationDelay: "0.3s", opacity: 0 }}
        >
          <Link
            href="/auth/signup"
            className="algo-btn-primary flex items-center gap-2 text-base px-8 py-4"
          >
            Start chatting <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/auth/login" className="algo-btn-ghost text-base px-8 py-4">
            I have an account
          </Link>
        </div>
      </section>

      {/* Scrolling interest ticker */}
      <div className="relative z-10 overflow-hidden py-6 mb-16">
        <div className="flex gap-3 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center bg-algo-card border border-algo-border rounded-full px-4 py-1.5 text-sm text-algo-text-muted shrink-0"
            >
              {item}
            </span>
          ))}
        </div>
        <style jsx>{`
          @keyframes scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="algo-card p-6 hover:border-algo-muted transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-algo-surface border border-algo-border flex items-center justify-center text-algo-accent mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-algo-text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Premium teaser */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
        <div
          className="algo-card p-8 text-center overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(255,101,132,0.05) 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ background: "radial-gradient(circle at 50% 0%, #6c63ff, transparent 60%)" }}
          />
          <span className="relative inline-flex items-center gap-1.5 bg-algo-accent/20 text-algo-accent text-xs font-mono px-3 py-1 rounded-full mb-4">
            <Zap className="w-3 h-3" /> ALGO PREMIUM — COMING SOON
          </span>
          <h2 className="font-display font-bold text-2xl mb-3 relative">
            Upgrade your connections
          </h2>
          <p className="text-algo-text-muted text-sm mb-6 relative max-w-md mx-auto">
            Advanced interest filters, priority matching, reconnect with past chats,
            and boosts to get seen first. Join the waitlist.
          </p>
          <button className="algo-btn-primary opacity-60 cursor-not-allowed">
            Join Premium Waitlist
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-algo-border py-8 text-center text-algo-text-muted text-xs">
        <span className="font-display font-semibold text-algo-text">algo</span>
        <span className="mx-3">·</span>
        Made for the chronically online
        <span className="mx-3">·</span>
        <Link href="/auth/signup" className="hover:text-algo-text transition-colors underline underline-offset-4">
          Get started free
        </Link>
      </footer>
    </div>
  );
}
