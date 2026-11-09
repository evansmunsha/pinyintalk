import { Bi } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import type { ToneFeedback as ToneFeedbackData } from "@/lib/tone-analysis";

const STATUS_LABELS = {
  clear: { text: "Clear", style: "bg-emerald-100 text-emerald-800" },
  practice: { text: "Practice", style: "bg-amber-100 text-amber-900" },
  unclear: { text: "Unclear", style: "bg-stone-200 text-stone-700" },
} as const;

export function ToneFeedback({ feedback }: { feedback: ToneFeedbackData }) {
  return (
    <section className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3" aria-label="Tone feedback">
      <Bi label={{ py: "shēngdiào fǎnkuì", en: "Tone feedback · AI estimate" }} align="start" />
      <p className="text-sm text-stone-700">{feedback.summary}</p>
      {feedback.syllables.length > 0 && (
        <ul className="space-y-2">
          {feedback.syllables.map((item, index) => {
            const status = STATUS_LABELS[item.status];
            return (
              <li key={`${item.pinyin}-${index}`} className="flex flex-wrap items-center gap-2 text-sm">
                <Pinyin text={item.pinyin} className="font-semibold" />
                <span className={`rounded-full px-2 py-0.5 text-xs ${status.style}`}>{status.text}</span>
                {item.tip && <span className="text-stone-600">{item.tip}</span>}
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-stone-500">Connected speech can affect this estimate.</p>
    </section>
  );
}
