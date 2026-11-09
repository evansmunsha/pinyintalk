export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-stone-200" />
      <div className="h-28 animate-pulse rounded-2xl bg-stone-200" />
      <div className="h-16 animate-pulse rounded-2xl bg-stone-200" />
      <div className="h-16 animate-pulse rounded-2xl bg-stone-200" />
    </div>
  );
}
