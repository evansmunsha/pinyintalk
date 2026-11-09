import Link from "next/link";
import { Bi } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { T } from "@/lib/ui-text";

export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-4 py-8 text-center">
      <div>
        <h1 className="text-4xl font-bold text-teal-700">Yadalingo</h1>
        <p className="mt-3 text-3xl font-semibold"><Pinyin text="nǐ hǎo" /></p>
        <p className="text-stone-500">hello</p>
      </div>
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
      </div>
    </main>
  );
}
