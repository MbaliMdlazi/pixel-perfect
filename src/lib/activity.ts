import { useCallback, useEffect, useState } from "react";

export type ActivityKind = "email" | "research" | "chat";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  label: string;
  at: number;
}

const KEY = "awpa.activity.v1";
const EVENT = "awpa-activity-change";

function read(): ActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as ActivityItem[]) : [];
  } catch {
    return [];
  }
}

export function logActivity(kind: ActivityKind, label: string) {
  if (typeof window === "undefined") return;
  const next = [
    { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, kind, label: label.slice(0, 90), at: Date.now() },
    ...read(),
  ].slice(0, 30);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function clearActivity() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const sync = useCallback(() => setItems(read()), []);

  useEffect(() => {
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  return items;
}

export function timeAgo(at: number) {
  const mins = Math.max(1, Math.round((Date.now() - at) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}
