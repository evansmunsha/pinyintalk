"use client";

import { signInAction } from "@/app/actions/auth";
import { Bi, ErrorBox } from "@/components/Bi";
import { T } from "@/lib/ui-text";
import Link from "next/link";
import { useActionState } from "react";

const input =
  "mt-1 block min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50";

export default function SignInPage() {
  const [state, formAction, pending] = useActionState(signInAction, null);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-teal-700">Yadalingo</h1>
        <h2 className="mt-4 text-2xl"><Bi label={T.welcomeBack} /></h2>
      </div>

      <form action={formAction} className="space-y-4">
        <ErrorBox message={state?.error ?? ""} />
        <label className="block text-stone-700">
          <Bi label={T.email} align="start" />
          <input name="email" type="email" required disabled={pending} autoComplete="email" className={input} />
        </label>
        <label className="block text-stone-700">
          <Bi label={T.passwordShort} align="start" />
          <input name="password" type="password" required disabled={pending} autoComplete="current-password" className={input} />
        </label>
        <button disabled={pending} className="min-h-12 w-full rounded-xl bg-teal-600 text-lg text-white disabled:opacity-60">
          <Bi label={pending ? T.signingIn : T.signIn} />
        </button>
        <p className="flex flex-col items-center gap-1 text-stone-600">
          <Bi label={T.newHere} />
          <Link href="/signup" className="flex min-h-11 items-center font-medium text-teal-700"><Bi label={T.signUp} /></Link>
        </p>
      </form>
    </main>
  );
}
