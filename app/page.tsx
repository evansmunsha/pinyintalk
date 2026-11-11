import type { Metadata } from "next";
import Link from "next/link";
import { Bi } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { getSiteUrl } from "@/lib/site";
import { T } from "@/lib/ui-text";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Learn Mandarin by voice with pinyin, tones, and Mei",
  description: "Pinyin Talk helps you learn Mandarin by speaking, reviewing phrases, hearing pinyin and tones, and practising with a friendly AI partner.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Pinyin Talk",
    description: "Learn Mandarin by voice with pinyin, tones, and a patient AI partner.",
    url: siteUrl,
    siteName: "Pinyin Talk",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinyin Talk",
    description: "Learn Mandarin by voice with pinyin, tones, and a patient AI partner.",
  },
};

export default function WelcomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Pinyin Talk",
    applicationCategory: "EducationApplication",
    operatingSystem: "Any",
    description: "Learn Mandarin by voice with pinyin, tones, and a patient AI partner.",
    audience: {
      "@type": "Audience",
      audienceType: "Language learners",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: siteUrl,
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-4 py-8 text-center">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div>
        <h1 className="text-4xl font-bold text-teal-700">Pinyin Talk</h1>
        <p className="mt-3 text-3xl font-semibold"><Pinyin text="nǐ hǎo" /></p>
        <p className="text-stone-500">hello</p>
      </div>

      <section className="space-y-4 text-left">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-stone-800">Learn Mandarin by voice</h2>
          <p className="text-stone-700">Pinyin Talk helps you learn Mandarin with pinyin, tones, and spoken practice that feels like having a patient partner nearby.</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-stone-800">Speak Chinese naturally</h3>
          <p className="text-stone-700">Hear every phrase aloud, listen again, and practise the sounds that matter most: pinyin, tone accuracy, and everyday Mandarin.</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-stone-800">Keep the phrases you already know</h3>
          <p className="text-stone-700">Add the words you know, review them on a schedule, and let Mei bring them back when you need them most so you do not forget them.</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-stone-800">Follow the tones</h3>
          <p className="text-stone-700">Use the tone colours, see each syllable clearly, and practise the four Mandarin tones as part of your daily speaking routine.</p>
        </div>
      </section>

      <div className="space-y-3 text-xl text-stone-700">
        <Bi label={T.tagline} />
        <Bi label={T.tagline2} />
      </div>
      <div className="space-y-3">
        <Link href="/signup" className="block min-h-12 rounded-xl bg-teal-600 py-3 text-lg text-white">
          <Bi label={T.getStarted} />
        </Link>
        <Link href="/signin" className="block min-h-12 rounded-xl border-2 border-stone-300 py-3 text-lg">
          <Bi label={T.iHaveAccount} />
        </Link>
        <Link href="/tone-guide" className="block min-h-12 rounded-xl border border-teal-300 bg-white py-3 text-lg text-teal-700">
          <Bi label={{ py: "shēngdiào zhīshì", en: "Tone guide" }} />
        </Link>
      </div>
    </main>
  );
}
