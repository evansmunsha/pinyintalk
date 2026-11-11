import Link from "next/link";
import { Bi } from "@/components/Bi";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white/80">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-4 text-center text-sm text-stone-600">
        <Link href="/about" className="min-h-10 rounded-md px-2 py-1 hover:text-teal-700">
          <Bi label={{ py: "guànyú wǒmen", en: "About" }} />
        </Link>
        <Link href="/legal/privacy" className="min-h-10 rounded-md px-2 py-1 hover:text-teal-700">
          <Bi label={{ py: "yǐn sī zhèngcè", en: "Privacy policy" }} />
        </Link>
        <Link href="/legal/terms" className="min-h-10 rounded-md px-2 py-1 hover:text-teal-700">
          <Bi label={{ py: "fúwù tiákuǎn", en: "Terms of use" }} />
        </Link>
        <Link href="/legal/community-rules" className="min-h-10 rounded-md px-2 py-1 hover:text-teal-700">
          <Bi label={{ py: "shèqū guīzé", en: "Community rules" }} />
        </Link>
        <Link href="/legal/cookies" className="min-h-10 rounded-md px-2 py-1 hover:text-teal-700">
          <Bi label={{ py: "qiǎokè biànzhǐ", en: "Cookie notice" }} />
        </Link>
      </div>
      <p className="pb-4 text-center text-xs text-stone-500">
        <Bi label={{ py: "shì gǎi yìng, yào shǒu xíng lǜshī shāngchá", en: "Draft pages for lawyer review before real users" }} />
      </p>
    </footer>
  );
}
