export type BadgeType =
  | "first_chat"
  | "chat_10"
  | "chat_100"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "night_owl"
  | "social_butterfly"
  | "top_rated"
  | "globetrotter";

export interface BadgeDef {
  id: BadgeType;
  label: string;
  emoji: string;
  desc: string;
}

export const BADGES: BadgeDef[] = [
  { id: "first_chat", emoji: "👋", label: "First Chat", desc: "Started your first conversation" },
  { id: "chat_10", emoji: "💬", label: "Chatty", desc: "Completed 10 chats" },
  { id: "chat_100", emoji: "🗣️", label: "Social Butterfly", desc: "Completed 100 chats" },
  { id: "streak_3", emoji: "🔥", label: "On Fire", desc: "3 day chat streak" },
  { id: "streak_7", emoji: "⚡", label: "Week Warrior", desc: "7 day chat streak" },
  { id: "streak_30", emoji: "🏆", label: "Legendary", desc: "30 day chat streak" },
  { id: "night_owl", emoji: "🦉", label: "Night Owl", desc: "Chatted after midnight" },
  { id: "social_butterfly", emoji: "🦋", label: "Butterfly", desc: "Chatted with 5 different countries" },
  { id: "top_rated", emoji: "⭐", label: "Top Rated", desc: "Average rating above 4.5" },
  { id: "globetrotter", emoji: "🌍", label: "Globetrotter", desc: "Matched with 10 different countries" },
];

export function getBadge(id: BadgeType): BadgeDef {
  return BADGES.find((b) => b.id === id) || BADGES[0];
}