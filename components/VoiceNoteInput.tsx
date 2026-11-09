"use client";

import { useEffect, useRef, useState } from "react";
import { AudioClip } from "@/components/AudioClip";
import { Bi, ErrorBox } from "@/components/Bi";
import { MAX_RECORD_SECONDS, useRecorder } from "@/lib/useRecorder";

export function VoiceNoteInput({ onChange }: { onChange: (audio: Blob | null) => void }) {
  const recorder = useRecorder();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function onRecorded(audio: Blob | null) {
    setError("");
    if (!audio) {
      setError("The recording was empty. Try again.");
      onChange(null);
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(audio);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    onChange(audio);
  }

  function clear() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setError("");
    onChange(null);
  }

  async function toggleRecording() {
    if (recorder.state === "recording") {
      onRecorded(await recorder.stop());
      return;
    }
    clear();
    await recorder.start(onRecorded);
  }

  return (
    <div className="space-y-2 rounded-xl border border-stone-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleRecording}
          className={`min-h-11 rounded-xl px-4 text-sm text-white ${recorder.state === "recording" ? "bg-red-600" : "bg-stone-700"}`}
        >
          <Bi label={recorder.state === "recording" ? { py: "tíngzhǐ", en: "Stop recording" } : { py: "lùyīn", en: "Record voice note" }} />
        </button>
        {recorder.state === "recording" && (
          <span role="status" className="text-sm text-stone-600">{recorder.seconds}/{MAX_RECORD_SECONDS}s</span>
        )}
        {previewUrl && (
          <button type="button" onClick={clear} className="min-h-11 px-2 text-sm text-red-700 underline">
            <Bi label={{ py: "qīngchú", en: "Remove recording" }} />
          </button>
        )}
      </div>
      {previewUrl && <AudioClip src={previewUrl} label={{ py: "tīng yīxià", en: "Preview voice note" }} />}
      {recorder.state === "blocked" && <p className="text-sm text-amber-800">Allow microphone access to record a voice note.</p>}
      {recorder.state === "error" && <p className="text-sm text-red-700">Could not access the microphone.</p>}
      <ErrorBox message={error} />
    </div>
  );
}
