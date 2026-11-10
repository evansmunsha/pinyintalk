"use client";

import { useState, useTransition } from "react";
import { updateCommunityProfileAction } from "@/app/actions/community-roles";
import { Bi } from "@/components/Bi";

const ROLES = [
  { value: "beginner", label: { py: "chūjí", en: "Beginner" } },
  { value: "learner", label: { py: "xuéxí zhě", en: "Learner" } },
  { value: "advanced", label: { py: "jìnjí", en: "Advanced" } },
] as const;

export function CommunityProfileForm({
  role,
  nativeSpeaker,
}: {
  role: string;
  nativeSpeaker: boolean;
}) {
  const [selectedRole, setSelectedRole] = useState(role === "teacher" ? "advanced" : role);
  const [isNative, setIsNative] = useState(nativeSpeaker);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  function save() {
    setMessage("");
    start(async () => {
      const result = await updateCommunityProfileAction({ role: selectedRole, nativeSpeaker: isNative });
      setMessage(result.ok ? "Saved." : result.error);
    });
  }

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold"><Bi label={{ py: "shèjiāo zīliào", en: "Community profile" }} align="start" /></h2>
      <label className="block space-y-1">
        <span className="text-sm"><Bi label={{ py: "nǐ de xuéxí juésè", en: "Your learner role" }} align="start" /></span>
        <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} disabled={role === "teacher"}
          className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3">
          {ROLES.map((item) => <option key={item.value} value={item.value}>{item.label.py} — {item.label.en}</option>)}
        </select>
      </label>
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" checked={isNative} onChange={(event) => setIsNative(event.target.checked)} className="h-5 w-5" />
        <Bi label={{ py: "wǒ shì hànyǔ mǔyǔ zhě", en: "I am a native Mandarin speaker" }} align="start" />
      </label>
      <button type="button" onClick={save} disabled={pending} className="min-h-11 rounded-xl bg-teal-700 px-5 text-white disabled:opacity-60">
        <Bi label={{ py: pending ? "zhèngzài bǎocún" : "bǎocún", en: pending ? "Saving…" : "Save" }} />
      </button>
      {message && <p role="status" className="text-sm text-stone-600">{message}</p>}
    </section>
  );
}
