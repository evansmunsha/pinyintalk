"use client";

import { signUpAction } from "@/app/actions/auth";
import { Bi, ErrorBox } from "@/components/Bi";
import { T } from "@/lib/ui-text";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

const input =
  "mt-1 block min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50";

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUpAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) router.push("/onboarding");
  }, [state, router]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-teal-700">Pinyin Talk</h1>
        <h2 className="mt-4 text-2xl"><Bi label={T.createAccount} /></h2>
      </div>

      <form action={formAction} className="space-y-4">
        <ErrorBox message={state?.error ?? ""} />
        <label className="block text-stone-700">
          <Bi label={T.name} align="start" />
          <input name="name" type="text" required disabled={pending} autoComplete="name" className={input} />
        </label>
        <label className="block text-stone-700">
          <Bi label={T.email} align="start" />
          <input name="email" type="email" required disabled={pending} autoComplete="email" className={input} />
        </label>
        <label className="block text-stone-700">
          <Bi label={T.password} align="start" />
          <input name="password" type="password" required minLength={8} disabled={pending} autoComplete="new-password" className={input} />
        </label>
        <button disabled={pending} className="min-h-12 w-full rounded-xl bg-teal-600 text-lg text-white disabled:opacity-60">
          <Bi label={pending ? T.creating : T.signUp} />
        </button>
        <p className="flex flex-col items-center gap-1 text-stone-600">
          <Bi label={T.haveAccount} />
          <Link href="/signin" className="flex min-h-11 items-center font-medium text-teal-700"><Bi label={T.signIn} /></Link>
        </p>
      </form>
    </main>
  );
}
