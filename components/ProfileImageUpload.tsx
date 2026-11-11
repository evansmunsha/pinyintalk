"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bi } from "@/components/Bi";
import { UserAvatar } from "@/components/UserAvatar";

export function ProfileImageUpload({
  name,
  initialImageUrl,
}: {
  name: string;
  initialImageUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("The image must be no larger than 2 MB.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    setPending(true);
    try {
      const response = await fetch("/api/profile/image", { method: "POST", body: formData });
      const result = await response.json() as { profileImageUrl?: string; error?: string };
      if (!response.ok || !result.profileImageUrl) {
        setError(result.error ?? "Your image could not be saved.");
        return;
      }
      setImageUrl(result.profileImageUrl);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (uploadError) {
      console.error("[profile-image] upload request failed:", uploadError);
      setError("Your image could not be saved. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">
        <Bi label={{ py: "zhàopiàn", en: "Profile picture" }} align="start" />
      </h2>
      <div className="flex items-center gap-3">
        <UserAvatar name={name} imageUrl={imageUrl} size={64} />
        <p className="text-sm text-stone-600">
          <Bi label={{ py: "shàngchuán JPG, PNG huò WebP, zuìdà 2 MB.", en: "Upload JPG, PNG, or WebP, up to 2 MB." }} align="start" />
        </p>
      </div>
      <form onSubmit={upload} className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Choose a profile picture"
          className="block min-h-11 w-full text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-teal-700 file:px-4 file:text-white"
        />
        <button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-teal-700 px-5 text-white disabled:opacity-60">
          <Bi label={{ py: pending ? "zhèngzài shàngchuán" : "shàngchuán zhàopiàn", en: pending ? "Uploading…" : "Upload picture" }} />
        </button>
      </form>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </section>
  );
}
