import { signOutAction } from "@/app/actions/auth";
import { Bi } from "@/components/Bi";
import { EnglishAfterToggle } from "@/components/EnglishAfterToggle";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T } from "@/lib/ui-text";

export default async function MePage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, englishAfterChinese: true },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl"><Bi label={T.me} align="start" /></h1>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-teal-700"><Bi label={T.account} align="start" /></p>
        <p className="mt-1 text-xl font-semibold">{user?.name}</p>
        <p className="break-all text-stone-600">{user?.email}</p>
      </div>
      <section className="space-y-3">
        <h2 className="text-lg"><Bi label={T.settings} align="start" /></h2>
        <EnglishAfterToggle initial={user?.englishAfterChinese ?? true} />
        <p className="px-1 text-stone-500"><Bi label={T.englishAfterHelp} align="start" /></p>
      </section>
      <form action={signOutAction}>
        <button className="min-h-12 w-full rounded-xl border border-stone-300 bg-white text-lg"><Bi label={T.signOut} /></button>
      </form>
    </div>
  );
}
