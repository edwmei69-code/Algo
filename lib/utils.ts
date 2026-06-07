import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Interest } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns the number of shared interests between two arrays */
export function countSharedInterests(a: Interest[], b: Interest[]): number {
  return a.filter((i) => b.includes(i)).length;
}

/** Format a date to a readable time string */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Truncate text to n characters */
export function truncate(text: string, n: number): string {
  return text.length > n ? text.slice(0, n) + "…" : text;
}

/** Generate a random avatar placeholder color based on username */
export function avatarColor(username: string): string {
  const colors = [
    "#6c63ff",
    "#ff6584",
    "#43e97b",
    "#f7971e",
    "#12c2e9",
    "#f64f59",
  ];
  const idx =
    username.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    colors.length;
  return colors[idx];
}

/** Get initials from username */
export function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}
