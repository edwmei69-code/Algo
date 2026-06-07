"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { REPORT_REASONS, ReportReason } from "@/types";
import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportModalProps {
  roomId: string;
  reportedId: string;
  reporterId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReportModal({
  roomId,
  reportedId,
  reporterId,
  onClose,
  onSuccess,
}: ReportModalProps) {
  const supabase = createClient();
  const [reason, setReason] = useState<ReportReason | "">("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);

    await supabase.from("reports").insert({
      reporter_id: reporterId,
      reported_id: reportedId,
      room_id: roomId,
      reason,
    });

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative algo-card w-full max-w-sm p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="font-display font-semibold">Report user</h2>
          </div>
          <button
            onClick={onClose}
            className="text-algo-text-muted hover:text-algo-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-algo-text-muted text-sm mb-4">
          Select the reason for your report. We take safety seriously.
        </p>

        <div className="flex flex-col gap-2 mb-6">
          {REPORT_REASONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setReason(value)}
              className={cn(
                "text-left px-4 py-3 rounded-xl border text-sm transition-all",
                reason === value
                  ? "border-red-500/50 bg-red-500/10 text-red-400"
                  : "border-algo-border text-algo-text-muted hover:border-algo-muted hover:text-algo-text"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!reason || loading}
          className="w-full py-3 rounded-xl font-display font-semibold text-sm transition-all
            bg-red-500/20 border border-red-500/40 text-red-400
            hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting…" : "Submit Report"}
        </button>
      </div>
    </div>
  );
}
