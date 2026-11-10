import { Pinyin } from "@/components/Pinyin";

export default function HistoryDetailLoading() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <p className="text-teal-700">
        <Pinyin text="qǐng děng yīxià" /> <span className="text-sm text-stone-600">Opening this conversation…</span>
      </p>
      <div className="h-11 w-36 animate-pulse rounded-xl bg-stone-200" />
      <div className="space-y-4">
        {[0, 1].map((item) => (
          <div key={item} className="space-y-3">
            <div className="ml-auto h-24 w-[90%] max-w-sm animate-pulse rounded-2xl bg-teal-100" />
            <div className="h-32 w-[90%] max-w-sm animate-pulse rounded-2xl bg-stone-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
