import { ROLE, USER_STATUS } from "@/domain/enums";
import type { Role, User } from "@/domain/types";
import { ok } from "@/lib/api/client";

export interface Session {
  user: User;
  roles: Role[];
}

export interface DemoAccount {
  id: string;
  role: Role;
  name: string;
  email: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "u-demo-cand",
    role: ROLE.CANDIDATE,
    name: "Ava Thompson",
    email: "candidate@demo.talentmatch",
    description: "Explore jobs, apply, and track your applications with AI match explanations.",
  },
  {
    id: "u-demo-rec",
    role: ROLE.RECRUITER,
    name: "Marcus Reed",
    email: "recruiter@demo.talentmatch",
    description: "Post jobs, review matches, and move applicants through the hiring pipeline.",
  },
  {
    id: "u-demo-hm",
    role: ROLE.HIRING_MANAGER,
    name: "Priya Nair",
    email: "hiring@demo.talentmatch",
    description: "Review candidates, leave structured feedback, and recommend decisions.",
  },
  {
    id: "u-demo-admin",
    role: ROLE.ADMIN,
    name: "Jordan Ellis",
    email: "admin@demo.talentmatch",
    description: "Moderate content, manage taxonomy, and monitor platform health.",
  },
];

export async function signInDemo(accountId: string): Promise<Session> {
  const account = DEMO_ACCOUNTS.find((a) => a.id === accountId);
  if (!account) {
    throw new Error("Unknown demo account");
  }
  const user: User = {
    id: account.id,
    email: account.email,
    name: account.name,
    roles: [account.role],
    status: USER_STATUS.ACTIVE,
    verifiedEmail: true,
    createdAt: new Date().toISOString(),
    headline: account.description.split(".")[0],
  };
  return ok<Session>({ user, roles: user.roles }, 600);
}

export async function registerDemo(
  name: string,
  email: string,
  password: string,
  role: Role,
): Promise<Session> {
  if (!name.trim() || !email.includes("@") || password.length < 8) {
    throw new Error("Check your details: email must be valid and password at least 8 characters.");
  }
  const user: User = {
    id: `u-new-${Date.now()}`,
    email,
    name,
    roles: [role],
    status: USER_STATUS.ACTIVE,
    verifiedEmail: true,
    createdAt: new Date().toISOString(),
  };
  return ok<Session>({ user, roles: user.roles }, 600);
}
