"use client";

import { useState, useTransition } from "react";
import { toggleFollowAction } from "@/app/actions/social";
import { Bi } from "@/components/Bi";
import { T } from "@/lib/ui-text";

export function FollowButton({ userId, initial }: { userId: string; initial: boolean }) {
  const [following, setFollowing] = useState(initial);
  const [pending, start] = useTransition();

  function toggle() {
    start(async () => {
      const res = await toggleFollowAction(userId);
      if (res.ok && typeof res.following === "boolean") setFollowing(res.following);
    });
  }

  return (
    <button onClick={toggle} disabled={pending} aria-pressed={following}
      className={`min-h-11 rounded-full border px-4 ${following ? "border-teal-600 bg-teal-50 text-teal-800" : "border-stone-300 bg-white"}`}>
      <Bi label={following ? T.following : T.follow} />
    </button>
  );
}
