import { useQuery } from "@tanstack/react-query";
import { getNotifications, getUnreadCount } from "@/lib/api/notifications";

export function useUnreadCount(userId?: string) {
  return useQuery({
    queryKey: ["notifications", "unread", userId],
    queryFn: () => getUnreadCount(userId ?? ""),
    enabled: Boolean(userId),
    refetchInterval: 30_000,
  });
}

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => getNotifications(userId ?? ""),
    enabled: Boolean(userId),
  });
}
