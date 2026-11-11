import type { Metadata } from "next";
import { Bi } from "@/components/Bi";

export const metadata: Metadata = {
  title: "Community rules",
  description: "Draft community rules for Pinyin Talk",
};

export default function CommunityRulesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-stone-700">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-teal-700"><Bi label={{ py: "shèqū guīzé", en: "Community rules" }} /></h1>
        <p className="mt-3 text-sm text-stone-500"><Bi label={{ py: "zhè shì gǎi yìng, yào shǒu xíng lǜshī shāngchá", en: "This is a draft and should be reviewed by a lawyer before real users" }} /></p>
      </header>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "gōnggòng yōu de wǎnglì", en: "Basic expectations" }} /></h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Be respectful to other learners and teachers.</li>
          <li>Keep feedback focused on tone, wording, or learning progress.</li>
          <li>Do not spam, post repeated nonsense, or flood the app with repetitive content.</li>
          <li>Do not share private contact details, money requests, passwords, or personal details.</li>
        </ul>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "bàogào hé xiāngguān", en: "Report and moderation" }} /></h2>
        <p>Use the report feature if something feels unsafe, inappropriate, or misleading. Moderators may review the content and take action, including removing entries or restricting access.</p>
      </section>
    </main>
  );
}
