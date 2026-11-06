import { detectHints } from "@/lib/hints";

// Collapsible hint cards for a phrase (matched from its pinyin).
export function HintCards({ pinyin }: { pinyin: string }) {
  const hints = detectHints(pinyin);
  if (!hints.length) return null;
  return (
    <div className="mt-3 space-y-2">
      {hints.map((h) => (
        <details key={h.key} className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold">
            💡 Hint: {h.title}
          </summary>
          <p className="mt-1">{h.body}</p>
          <ul className="mt-2 space-y-1">
            {h.examples.map((e) => (
              <li key={e.pinyin}>
                <span className="text-base font-medium">{e.pinyin}</span>
                <span className="block text-amber-800">{e.english}</span>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
