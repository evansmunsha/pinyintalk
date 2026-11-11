import type { Metadata } from "next";
import { Bi } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "About Pinyin Talk",
  description: "The story behind Pinyin Talk: a Mandarin learning app for spoken practice, memory review, and a patient AI partner.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Pinyin Talk",
    description: "The story behind Pinyin Talk: a Mandarin learning app for spoken practice and memory review.",
    url: `${siteUrl}/about`,
    siteName: "Pinyin Talk",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 text-stone-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-teal-700"><Bi label={{ py: "guànyú Pinyin Talk", en: "About Pinyin Talk" }} /></h1>
        <p className="text-sm text-stone-500"><Bi label={{ py: "wǒ shi Evans Munsha", en: "Created by Evans Munsha" }} /></p>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-stone-300 bg-stone-100 text-xl font-semibold text-stone-500">
            <Pinyin text="nǐ hǎo" />
          </div>
          <p className="text-sm text-stone-600">Photo slot for the creator. Replace this with a real image when ready.</p>
        </div>
        <p className="text-base leading-7">
          Pinyin Talk was created by Evans Munsha, a person who is passionate about learning Chinese. He loves to learn it and to speak it. He did not build it to compete with other apps.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold text-stone-800">Our story</h2>
        <p className="leading-7">
          It began as a tool for himself: a place to keep the Chinese he already knows, and to hear it spoken back to him so he does not forget it. It is his everyday partner for remembering and understanding everything he has learned from other teachers. He comes back to the app, adds the phrases he knows, writes them down, and hears them spoken to him again and again.
        </p>
        <p className="leading-7">
          The app is simple on purpose. It is there to help a learner keep the language alive, especially when there is no teacher or partner nearby. <span className="font-semibold"><Pinyin text="nǐ hǎo" /></span> is a small start, and every return to the app is another chance to listen, speak, and remember.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold text-stone-800">Who it is for</h2>
        <p className="leading-7">
          It is for people who study Chinese on their own and have no partner or teacher to speak with. For those who want company, the app lets them find other learners and teachers who can help. For those who would rather not talk to anyone, the app is still there, as a patient partner for learners who study alone, just like the creator.
        </p>
      </section>
    </main>
  );
}
