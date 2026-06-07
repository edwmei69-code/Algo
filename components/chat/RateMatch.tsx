"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateMatchProps {
  roomId: string;
  raterId: string;
  ratedId: string;
  ratedUsername: string;
  onDone: () => void;
}

export function RateMatch({ roomId, raterId, ratedId, ratedUsername, onDone }: RateMatchProps) {
  const supabase = createClient();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    await supabase.from("chat_ratings").upsert({
      room_id: roomId,
      rater_id: raterId,
      rated_id: ratedId,
      rating,
    });
    setSubmitted(true);
    setTimeout(onDone, 1200);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-[#13131f] border border-[#1e1e30] rounded-2xl p-8 text-center animate-fade-up">
          <span className="text-4xl">⭐</span>
          <p className="font-semibold text-white mt-3">Rating submitted!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#13131f] border border-[#1e1e30] rounded-2xl p-8 text-center w-full max-w-sm mx-4 animate-fade-up">
        <p className="text-[#7070a0] text-sm mb-1">How was your chat with</p>
        <p className="font-semibold text-white text-lg mb-6">{ratedUsername}?</p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-9 h-9 transition-colors",
                  (hover || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-[#3a3a55]"
                )}
              />
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDone}
            className="flex-1 py-3 rounded-xl border border-[#1e1e30] text-[#7070a0] text-sm hover:text-white transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!rating}
            className="flex-1 py-3 rounded-xl bg-[#6c63ff] text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-all"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}