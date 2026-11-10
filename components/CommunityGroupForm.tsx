"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCommunityGroupAction } from "@/app/actions/community-groups";
import { Bi, ErrorBox } from "@/components/Bi";

export function CommunityGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    start(async () => {
      const result = await createCommunityGroupAction({ name, description });
      if (result.ok && result.groupId) router.push(`/community/groups/${result.groupId}`);
      else if (!result.ok) setError(result.error);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold"><Bi label={{ py: "chuàngjiàn xuéxí xiǎozǔ", en: "Create a group" }} align="start" /></h2>
      <label className="block">
        <Bi label={{ py: "xiǎozǔ míngchēng", en: "Group name" }} align="start" className="mb-1" />
        <input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-stone-300 px-3" />
      </label>
      <label className="block">
        <Bi label={{ py: "jièshào", en: "Description" }} align="start" className="mb-1" />
        <textarea required minLength={10} maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} rows={3}
          className="w-full rounded-xl border border-stone-300 p-3" />
      </label>
      <ErrorBox message={error} />
      <button disabled={pending} className="min-h-12 w-full rounded-xl bg-teal-700 text-white disabled:opacity-60">
        <Bi label={{ py: pending ? "zhèngzài chuàngjiàn" : "chuàngjiàn", en: pending ? "Creating…" : "Create group" }} />
      </button>
    </form>
  );
}
