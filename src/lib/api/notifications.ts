import type { Notification } from "@/domain/types";
import { ok } from "@/lib/api/client";
import { NOTIFICATIONS_FOR_DEMO, NOTIFICATIONS_FOR_RECRUITER } from "@/lib/mock/notifications";

const candNotifications = new Map(NOTIFICATIONS_FOR_DEMO.map((n) => [n.id, n]));
const recNotifications = new Map(NOTIFICATIONS_FOR_RECRUITER.map((n) => [n.id, n]));

export async function getNotifications(userId: string): Promise<Notification[]> {
  const source = userId === "u-demo-rec" ? recNotifications : candNotifications;
  const items = Array.from(source.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return ok(items, 250);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const items = userId === "u-demo-rec" ? recNotifications : candNotifications;
  return ok(Array.from(items.values()).filter((n) => !n.read).length, 100);
}

export async function markNotificationRead(id: string): Promise<void> {
  const source = candNotifications.has(id) ? candNotifications : recNotifications;
  const n = source.get(id);
  if (n) source.set(id, { ...n, read: true });
  return ok(undefined, 100);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const source = userId === "u-demo-rec" ? recNotifications : candNotifications;
  for (const [id, n] of source) source.set(id, { ...n, read: true });
  return ok(undefined, 150);
}
