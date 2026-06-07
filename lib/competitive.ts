import { createClient } from "@/lib/supabase/client";
import { BadgeType } from "@/lib/badges";

const supabase = createClient();

/** Call this every time a chat ends to update streak + check badges */
export async function recordChatCompletion(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  // Get current streak
  const { data: existing } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  let newStreak = 1;
  let longestStreak = 1;

  if (existing) {
    const last = existing.last_chat_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (last === today) {
      newStreak = existing.current_streak;
    } else if (last === yesterdayStr) {
      newStreak = existing.current_streak + 1;
    } else {
      newStreak = 1;
    }

    longestStreak = Math.max(newStreak, existing.longest_streak || 1);
  }

  await supabase.from("streaks").upsert({
    user_id: userId,
    current_streak: newStreak,
    longest_streak: longestStreak,
    last_chat_date: today,
    updated_at: new Date().toISOString(),
  });

  // Check and award badges
  await checkAndAwardBadges(userId, newStreak);
}

async function awardBadge(userId: string, badge: BadgeType) {
  await supabase
    .from("badges")
    .upsert({ user_id: userId, badge_type: badge })
    .select();
}

async function checkAndAwardBadges(userId: string, streak: number) {
  // Count total chats
  const { count } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq("status", "ended");

  const totalChats = count || 0;

  if (totalChats >= 1) await awardBadge(userId, "first_chat");
  if (totalChats >= 10) await awardBadge(userId, "chat_10");
  if (totalChats >= 100) await awardBadge(userId, "chat_100");

  // Streak badges
  if (streak >= 3) await awardBadge(userId, "streak_3");
  if (streak >= 7) await awardBadge(userId, "streak_7");
  if (streak >= 30) await awardBadge(userId, "streak_30");

  // Night owl
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) await awardBadge(userId, "night_owl");

  // Check average rating
  const { data: ratings } = await supabase
    .from("chat_ratings")
    .select("rating")
    .eq("rated_id", userId);

  if (ratings && ratings.length >= 5) {
    const avg = ratings.reduce((a, r) => a + r.rating, 0) / ratings.length;
    if (avg >= 4.5) await awardBadge(userId, "top_rated");
  }
}