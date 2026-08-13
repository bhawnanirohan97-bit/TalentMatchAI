import Link from "next/link";
import { AtSign, Globe, Rss } from "lucide-react";
import { Logo } from "@/components/shared/logo";

const columns = [
  {
    title: "For candidates",
    links: [
      { label: "Find jobs", href: "/jobs" },
      { label: "Browse companies", href: "/companies" },
      { label: "Recommendations", href: "/candidate/recommendations" },
      { label: "Sign up", href: "/signup" },
    ],
  },
  {
    title: "For employers",
    links: [
      { label: "Post a job", href: "/recruiter" },
      { label: "Recruiter workspace", href: "/recruiter" },
      { label: "Hiring analytics", href: "/recruiter/analytics" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Smart job portal and applicant tracking system with explainable AI matching. Built for transparent hiring.
            </p>
            <div className="mt-5 flex gap-2">
              {[AtSign, Globe, Rss].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="size-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TalentMatch AI. Portfolio demo build.</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
