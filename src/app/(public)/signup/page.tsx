import type { Metadata } from "next";
import { SignupView } from "@/components/auth/signup-view";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a candidate account on TalentMatch AI.",
};

export default function SignupPage() {
  return <SignupView />;
}
