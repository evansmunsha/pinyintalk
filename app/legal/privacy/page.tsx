import type { Metadata } from "next";
import { Bi } from "@/components/Bi";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Draft privacy policy for Pinyin Talk",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-stone-700">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-teal-700"><Bi label={{ py: "yǐn sī zhèngcè", en: "Privacy policy" }} /></h1>
        <p className="mt-3 text-sm text-stone-500"><Bi label={{ py: "zhè shì gǎi yìng, yào shǒu xíng lǜshī shāngchá", en: "This is a draft and should be reviewed by a lawyer before real users" }} /></p>
      </header>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "zǒng guān", en: "Overview" }} /></h2>
        <p>Pinyin Talk stores the data needed to run the app: account details, profile information, phrases, voice recordings, AI chat history, community posts, private chat messages, reports, and admin review data.</p>
        <p>We use a database for app records, cloud storage for files such as profile images and saved voice clips, and the Google Gemini API for chat and speech features. This page describes the current draft behavior and is not legal advice.</p>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "huòqǔ de shùjù", en: "Data we collect" }} /></h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Account data: name, email, password hash, and sign-in metadata.</li>
          <li>Profile data: profile picture, role, native speaker flag, and settings such as English-after-Chinese preferences.</li>
          <li>Learning data: phrases, review records, lesson progress, and saved conversation history.</li>
          <li>Voice data: voice recordings, generated audio clips, and transcripts used for speech recognition or playback.</li>
          <li>Community data: posts, replies, reports, teacher applications, group data, and moderation actions.</li>
          <li>Private chat data: one-to-one messages, invitations, blocks, and safety notice logs.</li>
        </ul>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "cúnchǔ dìdiǎn", en: "Where data is stored" }} /></h2>
        <p>Data is stored in the app database and cloud object storage. The app may also send relevant content to external AI services for speech recognition, text generation, or voice output. Hosting and storage providers may process the data as part of operating the service.</p>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "yǐngyòng wàiwài fúwù", en: "Third-party services" }} /></h2>
        <p>Google Gemini is used for chat, speech recognition, and text-to-speech features. The database and storage provider process account, learning, community, and media data. Hosting may also log technical details needed to keep the service running.</p>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "shǒucún shíjiān", en: "Retention" }} /></h2>
        <p>Retention periods depend on the type of data. We keep account and learning records as long as the account remains active or as needed to provide the service. Messages, reports, and moderation records may be kept to support safety and dispute handling.</p>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "shānchú hé xuǎnzé", en: "Your choices" }} /></h2>
        <p>You can delete your account or request deletion of your recorded messages or voice clips by contacting the app owner. The app should provide a clear account-deletion flow and data-download or deletion controls before launch. This draft page describes the intended process.</p>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-800"><Bi label={{ py: "liánxì", en: "Contact" }} /></h2>
        <p>Email: hello@pinyintalk.app</p>
        <p>Created by Evans Munsha, the creator of Pinyin Talk. This is a draft page and should be reviewed by a lawyer before real users arrive.</p>
      </section>
    </main>
  );
}
