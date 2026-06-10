"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/screener", label: "스크리너" },
  { href: "/watchlist", label: "관심종목" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="mr-8 flex items-center gap-2 font-semibold">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span>StocksV1</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === href
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        {session && (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {session.user.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
