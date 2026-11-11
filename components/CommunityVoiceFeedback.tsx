"use client";

import { useState, useTransition } from "react";
import { submitCommunityVoiceFeedbackAction } from "@/app/actions/community-feedback";
import { Bi, ErrorBox } from "@/components/Bi";
import { CommunityRoleBadge } from "@/components/CommunityRoleBadge";
import { UserAvatar } from "@/components/UserAvatar";

type Vote = {
  id: string;
  rating: string;
  comment: string | null;
  user: { id: string; name: string; profileImageUrl: string | null; role: string; nativeSpeaker: boolean };
};

const RATINGS = [
  { value: "sounds_native", py: "tīng qǐlái hěn dìdao", en: "Sounds native" },
  { value: "almost_there", py: "kuài yào shuō hǎo le", en: "Almost there" },
  { value: "needs_practice", py: "xūyào zài liànxí", en: "Needs practice" },
] as const;

export function CommunityVoiceFeedback({
  questionId,
  votes,
  currentUserId,
}: {
  questionId: string;
  votes: Vote[];
  currentUserId: string;
}) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();
  const alreadyVoted = votes.some((vote) => vote.user.id === currentUserId);

  function vote(rating: (typeof RATINGS)[number]["value"]) {
    setError("");
    start(async () => {
      const result = await submitCommunityVoiceFeedbackAction({ questionId, rating, comment });
      if (result.ok) setSent(true);
      else setError(result.error);
    });
  }

  return (
    <section className="space-y-2 rounded-xl bg-indigo-50 p-3">
      <h3 className="font-semibold"><Bi label={{ py: "tīng yīnyǔ yǐhòu de fǎnkuì", en: "Voice feedback" }} align="start" /></h3>
      <div className="grid gap-2 sm:grid-cols-3">
        {RATINGS.map((rating) => {
          const points = votes.filter((vote) => vote.rating === rating.value)
            .reduce((sum, vote) => sum + (vote.user.role === "teacher" ? 2 : 1), 0);
          return (
            <button key={rating.value} type="button" disabled={pending || alreadyVoted}
              onClick={() => vote(rating.value)}
              className="min-h-12 rounded-lg border border-indigo-200 bg-white px-2 py-1 text-sm disabled:opacity-60">
              <Bi label={{ py: rating.py, en: rating.en }} />
              <span className="text-xs text-stone-500">{points} {points === 1 ? "vote" : "votes"}</span>
            </button>
          );
        })}
      </div>
      {!alreadyVoted && (
        <label className="block">
          <Bi label={{ py: "nǎ yí gè cí huò shēngdiào xūyào xiūzhèng?", en: "Optional: which word or tone should improve?" }} align="start" className="mb-1 text-sm" />
          <input value={comment} onChange={(event) => setComment(event.target.value)} maxLength={300}
            className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3" />
        </label>
      )}
      {votes.length > 0 && (
        <ul className="space-y-2">
          {votes.map((vote) => (
            <li key={vote.id} className="rounded-lg bg-white p-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <UserAvatar name={vote.user.name} imageUrl={vote.user.profileImageUrl} size={32} />
                <span className="font-medium">{vote.user.name}</span>
                <CommunityRoleBadge role={vote.user.role} nativeSpeaker={vote.user.nativeSpeaker} />
                <Bi label={{ py: RATINGS.find((rating) => rating.value === vote.rating)?.py ?? "fǎnkuì", en: RATINGS.find((rating) => rating.value === vote.rating)?.en ?? "Feedback" }} />
              </div>
              {vote.comment && <p className="mt-1">{vote.comment}</p>}
            </li>
          ))}
        </ul>
      )}
      {sent && <p role="status" className="text-sm text-emerald-800"><Bi label={{ py: "xièxie nǐ de fǎnkuì.", en: "Thank you for your feedback." }} align="start" /></p>}
      <ErrorBox message={error} />
    </section>
  );
}
