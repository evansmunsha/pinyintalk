import { Bi } from "@/components/Bi";

type Role = "beginner" | "learner" | "advanced" | "teacher";

const ROLE_LABELS: Record<Role, { py: string; en: string; color: string }> = {
  beginner: { py: "chūjí", en: "Beginner", color: "bg-sky-100 text-sky-900" },
  learner: { py: "xuéxí zhě", en: "Learner", color: "bg-teal-100 text-teal-900" },
  advanced: { py: "jìnjí", en: "Advanced", color: "bg-violet-100 text-violet-900" },
  teacher: { py: "lǎoshī", en: "Teacher", color: "bg-amber-100 text-amber-950" },
};

export function CommunityRoleBadge({ role, nativeSpeaker = false }: { role: string; nativeSpeaker: boolean }) {
  const label = ROLE_LABELS[role as Role] ?? ROLE_LABELS.beginner;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${label.color}`}>
        <Bi label={{ py: label.py, en: label.en }} />
      </span>
      {nativeSpeaker && (
        <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-900">
          <Bi label={{ py: "mǔyǔ zhě", en: "Native speaker" }} />
        </span>
      )}
    </span>
  );
}
