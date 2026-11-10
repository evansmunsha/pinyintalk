import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { Bi } from "@/components/Bi";
import { EnglishAfterToggle } from "@/components/EnglishAfterToggle";
import { CommunityProfileForm } from "@/components/CommunityProfileForm";
import { isMistakeReportAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T } from "@/lib/ui-text";

export default async function MePage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, englishAfterChinese: true, role: true, nativeSpeaker: true },
  });
  const isAdmin = await isMistakeReportAdmin(userId);

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
        {user && <CommunityProfileForm role={user.role} nativeSpeaker={user.nativeSpeaker} />}
        <p className="px-1 text-stone-500"><Bi label={T.englishAfterHelp} align="start" /></p>
      </section>
      {isAdmin && (
        <div className="space-y-2">
          <Link href="/admin/reports" className="flex min-h-12 items-center justify-center rounded-xl bg-white shadow-sm">
            <Bi label={{ py: "cuòwù bàogào", en: "Mistake reports" }} />
          </Link>
          <Link href="/admin/teachers" className="flex min-h-12 items-center justify-center rounded-xl bg-white shadow-sm">
            <Bi label={{ py: "lǎoshī shēnqǐng", en: "Teacher applications" }} />
          </Link>
          <Link href="/admin/community-reports" className="flex min-h-12 items-center justify-center rounded-xl bg-white shadow-sm">
            <Bi label={{ py: "dàjiā de bàogào", en: "Community post reports" }} />
          </Link>
        </div>
      )}
      <form action={signOutAction}>
        <button className="min-h-12 w-full rounded-xl border border-stone-300 bg-white text-lg"><Bi label={T.signOut} /></button>
      </form>
    </div>
  );
}
