import type { Metadata } from "next";
import { Bi } from "@/components/Bi";

export const metadata: Metadata = {
  title: "Cookie notice",
  description: "Draft cookie notice for Pinyin Talk",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-stone-700">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-teal-700"><Bi label={{ py: "qiǎokè biànzhǐ", en: "Cookie notice" }} /></h1>
        <p className="mt-3 text-sm text-stone-500"><Bi label={{ py: "zhè shì gǎi yìng, yào shǒu xíng lǜshī shāngchá", en: "This is a draft and should be reviewed by a lawyer before real users" }} /></p>
      </header>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "qiǎokè shénme", en: "What cookies are used" }} /></h2>
        <p>Pinyin Talk may use cookies or browser storage to keep the app signed in, remember settings, and support the app&apos;s small session features. If the app uses cookies, they are limited to user experience and security needs.</p>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "wèizhu yǒu gài zhǔn", en: "Why they are used" }} /></h2>
        <p>Cookies help with login sessions, remembering language preferences, and keeping the app stable on mobile devices. We do not use cookies for advertising or unrelated tracking.</p>
      </section>
    </main>
  );
}
