import Link from "next/link";
import { Bi } from "@/components/Bi";
import { T } from "@/lib/ui-text";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl"><Bi label={T.notFound} /></h1>
      <Link href="/" className="min-h-12 rounded-xl bg-teal-600 py-3 text-lg text-white"><Bi label={T.goHome} /></Link>
    </main>
  );
}
