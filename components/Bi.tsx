import { errorLabel, type Label } from "@/lib/ui-text";
import { Pinyin } from "@/components/Pinyin";

// Pinyin on top (larger), English meaning underneath (smaller). Size follows the parent text size.
export function Bi({
  label,
  align = "center",
  className = "",
}: {
  label: Label;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <span
      className={`flex flex-col leading-snug ${align === "center" ? "items-center text-center" : "items-start text-left"} ${className}`}
    >
      <span className="break-words text-[1.05em] font-semibold"><Pinyin text={label.py} /></span>
      <span className="break-words text-[0.72em] font-normal opacity-75">{label.en}</span>
    </span>
  );
}

// Error message with a pinyin headline and the English reason beneath.
export function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-red-800">
      <Bi label={errorLabel(message)} align="start" />
    </div>
  );
}
