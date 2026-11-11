import type { Metadata } from "next";
import Link from "next/link";
import { Bi } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Mandarin tones explained",
  description: "A simple guide to the four Mandarin tones and pinyin, with examples and a quick way to practise listening and speaking.",
  alternates: { canonical: "/tone-guide" },
  openGraph: {
    title: "Mandarin tones explained",
    description: "A simple guide to the four Mandarin tones and pinyin, with examples and quick listening practice.",
    url: `${siteUrl}/tone-guide`,
    siteName: "Pinyin Talk",
    type: "article",
  },
};

export default function ToneGuidePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-4 py-8 text-stone-800">
      <Link href="/" className="text-teal-700 underline">← Home</Link>
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-teal-700">Mandarin tones guide</h1>
        <p className="text-lg text-stone-700">Tones change the meaning of a syllable, so listening and speaking carefully matters.</p>
      </header>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold">The four tones</h2>
        <ul className="space-y-4 text-stone-700">
          <li>
            <p className="text-xl font-semibold text-blue-700"><Pinyin text="mā" /></p>
            <p>First tone: high and level. It sounds flat and steady.</p>
          </li>
          <li>
            <p className="text-xl font-semibold text-green-700"><Pinyin text="má" /></p>
            <p>Second tone: rising. It starts lower and rises.</p>
          </li>
          <li>
            <p className="text-xl font-semibold text-violet-700"><Pinyin text="mǎ" /></p>
            <p>Third tone: dipping low, then rising again. It is the most noticeable tone change.</p>
          </li>
          <li>
            <p className="text-xl font-semibold text-red-700"><Pinyin text="mà" /></p>
            <p>Fourth tone: falling sharply. It drops quickly.</p>
          </li>
        </ul>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold">Why pinyin matters</h2>
        <p className="text-stone-700">Pinyin shows the sound of each syllable. When you read <Pinyin text="nǐ hǎo" />, you can hear the tone order and match your speaking more accurately.</p>
        <p className="text-stone-700">If you say the wrong tone, the meaning changes. For example, <Pinyin text="mā" /> means mother, while <Pinyin text="mà" /> means scold.</p>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold">Practice tips</h2>
        <ul className="list-disc space-y-2 pl-5 text-stone-700">
          <li>Listen to each syllable before speaking it.</li>
          <li>Say one phrase at a time and keep the tone pattern clear.</li>
          <li>Use the tone colours to remember what each mark should sound like.</li>
        </ul>
      </section>

      <div className="pt-2">
        <Link href="/signup" className="block min-h-12 rounded-xl bg-teal-600 py-3 text-center text-lg text-white">
          <Bi label={{ py: "kāishǐ xuéxí", en: "Start learning" }} />
        </Link>
      </div>
    </main>
  );
}
