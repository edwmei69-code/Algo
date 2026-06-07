export type Interest =
  | "gym"
  | "football"
  | "gaming"
  | "fashion"
  | "business"
  | "music"
  | "studying"
  | "dating"
  | "memes"
  | "streaming"
  | "investing"
  | "university";

export interface Profile {
  id: string;
  username: string;
  age: number | null;
  country: string | null;
  interests: Interest[];
  is_premium: boolean;
  is_online: boolean;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  user1_id: string;
  user2_id: string;
  status: "active" | "ended";
  ended_by: string | null;
  created_at: string;
  ended_at: string | null;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface MatchQueueEntry {
  id: string;
  user_id: string;
  interests: Interest[];
  joined_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  room_id: string;
  reason: string;
  created_at: string;
}

export type ReportReason =
  | "spam"
  | "harassment"
  | "inappropriate_content"
  | "underage"
  | "other";

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam or bot" },
  { value: "harassment", label: "Harassment or hate" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "underage", label: "Appears underage" },
  { value: "other", label: "Other" },
];

export const INTERESTS: { id: Interest; label: string; emoji: string }[] = [
  { id: "gym", label: "Gym", emoji: "💪" },
  { id: "football", label: "Football", emoji: "⚽" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "fashion", label: "Fashion", emoji: "👗" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "studying", label: "Studying", emoji: "📚" },
  { id: "dating", label: "Dating", emoji: "💘" },
  { id: "memes", label: "Memes", emoji: "😂" },
  { id: "streaming", label: "Streaming", emoji: "📺" },
  { id: "investing", label: "Investing", emoji: "📈" },
  { id: "university", label: "University", emoji: "🎓" },
];
