"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/review", label: "Review", icon: "🎧" },
  { href: "/mei", label: "Mei", icon: "💬" },
  { href: "/phrases", label: "My phrases", icon: "📒" },
];

// Bottom tab bar on phones, left sidebar from 768px.
export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] md:inset-y-0 md:right-auto md:w-56 md:flex-col md:gap-1 md:border-r md:border-t-0 md:p-3"
    >
      <span className="hidden px-3 py-4 text-xl font-bold text-teal-700 md:block">Yadalingo</span>
      {TABS.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium md:min-h-12 md:flex-none md:flex-row md:justify-start md:gap-3 md:rounded-xl md:px-3 md:text-base ${
              active ? "text-teal-700 md:bg-teal-50" : "text-stone-500"
            }`}
          >
            <span className="text-xl" aria-hidden>{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
