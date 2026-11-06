import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const session = await auth();
  const [due, total] = await Promise.all([
    prisma.phrase.count({ where: { userId, nextReviewAt: { lte: new Date() } } }),
    prisma.phrase.count({ where: { userId } }),
  ]);
  const name = session?.user?.name?.split(" ")[0] ?? "friend";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hello, {name}!</h1>
      {total === 0 ? (
        <Link href="/onboarding" className="block rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-lg">You haven&apos;t added any phrases yet.</p>
          <p className="mt-1 font-semibold text-teal-700">Tap here to add your first one.</p>
        </Link>
      ) : (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-5xl font-bold text-teal-700">{due}</p>
          <p className="text-stone-600">{due === 1 ? "phrase" : "phrases"} due today</p>
        </div>
      )}
      <div className="space-y-3">
        <Link href="/review" className="block min-h-14 rounded-2xl bg-teal-600 py-4 text-center text-xl font-semibold text-white">Start review</Link>
        <Link href="/phrases" className="block min-h-14 rounded-2xl border border-stone-300 bg-white py-4 text-center text-xl">My phrases</Link>
      </div>
      <form action={signOutAction}>
        <button className="min-h-11 w-full text-stone-500 underline">Sign out</button>
      </form>
    </div>
  );
}
