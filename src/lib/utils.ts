import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function formatSalary(min: number, max: number, currency = "USD"): string {
  const fmt = (n: number) =>
    n >= 1000
      ? `$${Math.round(n / 1000)}${n % 1000 === 0 ? "k" : `k+`}`
      : `$${n}`;
  if (currency === "INR") {
    const fmtInr = (n: number) =>
      n >= 100000
        ? `₹${Math.round(n / 100000)} L`
        : `₹${Math.round(n / 1000)}k`;
    return `${fmtInr(min)} – ${fmtInr(max)}`;
  }
  return `${fmt(min)} – ${fmt(max)}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function formatRelativeDays(iso: string): string {
  const d = daysUntil(iso);
  if (d < 0) return "Closed";
  if (d === 0) return "Closes today";
  if (d === 1) return "Closes tomorrow";
  return `${d} days left`;
}

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

export function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 3600000).toISOString();
}

export function daysFromNowIso(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
