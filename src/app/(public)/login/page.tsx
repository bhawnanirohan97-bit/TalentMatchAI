import type { Metadata } from "next";
import { LoginView } from "@/components/auth/login-view";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to TalentMatch AI as a candidate, recruiter, hiring manager, or administrator.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const account = typeof params.account === "string" ? params.account : undefined;
  return <LoginView defaultAccount={account} />;
}
