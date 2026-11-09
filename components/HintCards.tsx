import { Bi } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { detectHints } from "@/lib/hints";
import { T } from "@/lib/ui-text";

// Collapsible hint cards for a phrase (matched from its pinyin).
// The explanation text is the English meaning, shown under the pinyin title.
export function HintCards({ pinyin }: { pinyin: string }) {
  const hints = detectHints(pinyin);
  if (!hints.length) return null;
  return (
    <div className="mt-3 space-y-2">
      {hints.map((h) => (
        <details key={h.key} className="rounded-xl bg-amber-50 p-3 text-amber-950">
          <summary className="flex min-h-11 cursor-pointer items-center gap-2">
            <span aria-hidden>💡</span>
            <Bi label={{ py: `${T.hint.py}: ${h.titlePinyin}`, en: `${T.hint.en}: ${h.title}` }} align="start" />
          </summary>
          <p className="mt-1 text-sm">{h.body}</p>
          <ul className="mt-2 space-y-2">
            {h.examples.map((e) => (
              <li key={e.pinyin}>
                <span className="block text-lg font-semibold"><Pinyin text={e.pinyin} /></span>
                <span className="block text-sm text-amber-800">{e.english}</span>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
