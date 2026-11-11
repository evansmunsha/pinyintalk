import type { Metadata } from "next";
import { Bi } from "@/components/Bi";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Draft terms of use for Pinyin Talk",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-stone-700">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-teal-700"><Bi label={{ py: "fúwù tiákuǎn", en: "Terms of use" }} /></h1>
        <p className="mt-3 text-sm text-stone-500"><Bi label={{ py: "zhè shì gǎi yìng, yào shǒu xíng lǜshī shāngchá", en: "This is a draft and should be reviewed by a lawyer before real users" }} /></p>
      </header>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "mùdì", en: "Purpose" }} /></h2>
        <p>Pinyin Talk is a learning app that supports speaking practice, phrase review, and community discussions for Mandarin learners. The service is intended for educational use, not for medical, legal, or professional advice.</p>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "shǐyòng guīzé", en: "Use rules" }} /></h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Users must be at least 13 years old to create an account; private chats with teachers should only be used by people 18 or older or with parent permission.</li>
          <li>Do not share money, passwords, personal details, or private contact information in public or private chat.</li>
          <li>Do not harass, threaten, spam, impersonate another user, or post abusive content.</li>
          <li>Follow the app rules and report inappropriate content or safety concerns.</li>
        </ul>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "wǒmen de zé rèn", en: "Our responsibility" }} /></h2>
        <p>We try to provide a helpful and safe environment, but the app is not a substitute for in-person teaching, safety oversight, or legal counsel. We may remove content, restrict access, or suspend accounts if rules are broken.</p>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "sǐlì", en: "Service changes" }} /></h2>
        <p>We may update features, change rules, or improve safety at any time. Continued use means you accept the current policy and terms.</p>
      </section>
    </main>
  );
}
