import Link from "next/link";
import { Bi } from "@/components/Bi";
import { T } from "@/lib/ui-text";

// Learn hub: lessons, listening drills, review and your own phrases.
export default function LearnPage() {
  const cards = [
    { href: "/learn/lessons", icon: "📚", title: T.lessons, help: T.lessonsHelp },
    { href: "/learn/drills", icon: "👂", title: T.drills, help: T.drillsHelp },
    { href: "/review", icon: "🎧", title: T.review, help: T.reviewHelp },
    { href: "/phrases", icon: "📒", title: T.myPhrases, help: T.phrasesHelp },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl"><Bi label={T.learn} align="start" /></h1>
      {cards.map((c) => (
        <Link key={c.href} href={c.href} className="flex min-h-20 items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <span className="text-4xl" aria-hidden>{c.icon}</span>
          <span className="space-y-1">
            <span className="block text-xl"><Bi label={c.title} align="start" /></span>
            <span className="block"><Bi label={c.help} align="start" /></span>
          </span>
        </Link>
      ))}
    </div>
  );
}
