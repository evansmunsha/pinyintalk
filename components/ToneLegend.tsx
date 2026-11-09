import { Pinyin } from "@/components/Pinyin";
import { TONE_EXAMPLES } from "@/lib/tone-colors";

export function ToneLegend() {
  return (
    <details className="relative z-30">
      <summary
        aria-label="Pinyin tone colour help"
        title="Pinyin tone colour help"
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-stone-300 bg-white text-lg font-semibold text-stone-700 shadow-sm"
      >
        <span aria-hidden>?</span>
      </summary>
      <div className="absolute right-0 top-12 w-56 rounded-xl border border-stone-200 bg-white p-3 shadow-lg">
        <p className="mb-2 text-sm font-semibold text-stone-800">Pinyin tone colours</p>
        <ul className="space-y-1.5">
          {TONE_EXAMPLES.map((example) => (
            <li key={example.tone} className="flex items-center justify-between gap-3 text-sm">
              <Pinyin text={example.pinyin} />
              <span className="text-right text-stone-600">{example.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
