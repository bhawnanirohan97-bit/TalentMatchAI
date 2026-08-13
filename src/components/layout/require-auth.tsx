"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/session";

export function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const router = useRouter();
  const { user, roles: userRoles, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (roles.length > 0 && !userRoles.some((r) => roles.includes(r))) {
      router.replace("/");
    }
  }, [loading, user, userRoles, roles, router]);

  if (loading || !user || (roles.length > 0 && !userRoles.some((r) => roles.includes(r)))) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}
