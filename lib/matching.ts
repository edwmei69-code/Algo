import { createClient } from "@/lib/supabase/client";
import { Interest, MatchQueueEntry } from "@/types";
import { countSharedInterests } from "@/lib/utils";

const supabase = createClient();

/** Add current user to the match queue */
export async function joinQueue(userId: string, interests: Interest[]) {
  const { error } = await supabase
    .from("match_queue")
    .upsert({ user_id: userId, interests, joined_at: new Date().toISOString() });

  if (error) throw error;
}

/** Remove current user from the match queue */
export async function leaveQueue(userId: string) {
  await supabase.from("match_queue").delete().eq("user_id", userId);
}

/**
 * Try to find a match for the current user.
 * Returns a room_id if matched, null if no match yet.
 *
 * Matching priority:
 * 1. Most shared interests
 * 2. Longest wait time (FIFO fallback)
 * Not blocked by either party.
 */
export async function findMatch(
  userId: string,
  interests: Interest[]
): Promise<string | null> {
  // Get blocked user IDs (both directions)
  const { data: blocks } = await supabase
    .from("blocks")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

  const blockedIds = new Set<string>(
    (blocks || []).flatMap((b) => [b.blocker_id, b.blocked_id])
  );
  blockedIds.delete(userId);

  // Get all queue entries except self
  const { data: queue } = await supabase
    .from("match_queue")
    .select("*")
    .neq("user_id", userId)
    .order("joined_at", { ascending: true });

  if (!queue || queue.length === 0) return null;

  // Filter out blocked users
  const candidates = (queue as MatchQueueEntry[]).filter(
    (entry) => !blockedIds.has(entry.user_id)
  );

  if (candidates.length === 0) return null;

  // Score candidates by shared interests
  const scored = candidates.map((c) => ({
    ...c,
    score: countSharedInterests(interests, c.interests as Interest[]),
  }));

  // Pick best match (highest score, then oldest in queue)
  scored.sort((a, b) => b.score - a.score || 0);
  const best = scored[0];

  // Atomically: remove both from queue, create room
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({ user1_id: userId, user2_id: best.user_id })
    .select()
    .single();

  if (roomError || !room) return null;

  // Remove both from queue
  await supabase
    .from("match_queue")
    .delete()
    .in("user_id", [userId, best.user_id]);

  return room.id;
}

/** End a room */
export async function endRoom(roomId: string, endedBy: string) {
  await supabase
    .from("rooms")
    .update({ status: "ended", ended_by: endedBy, ended_at: new Date().toISOString() })
    .eq("id", roomId);
}
