"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/session";
import { WORKSPACE_HOME } from "@/domain/constants";
import type { Role } from "@/domain/enums";

export function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: Role[];
}) {
  const router = useRouter();
  const { user, roles: userRoles, loading } = useAuth();

  const canAccess = roles.length === 0 || userRoles.some((r) => roles.includes(r));

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!canAccess) {
      const home = userRoles[0] ? WORKSPACE_HOME[userRoles[0]] : "/";
      router.replace(home);
    }
  }, [loading, user, userRoles, canAccess, router]);

  if (loading || !user || !canAccess) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}
