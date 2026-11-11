"use client";

import { useEffect, useState } from "react";
import { Bi } from "@/components/Bi";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; }>; 
};

function canOfferInstall() {
  if (typeof window === "undefined") return false;
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return !isStandalone && (isIOS || "beforeinstallprompt" in window);
}

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(canOfferInstall);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => setCanInstall(false);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!canInstall) return null;

  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  async function handleInstall() {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      setCanInstall(false);
      return;
    }

    if (isIOS) {
      setShowIosInstructions(true);
      return;
    }

    setCanInstall(false);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleInstall}
        className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm"
      >
        <Bi label={{ py: "ānzhuāng", en: "Install app" }} />
      </button>
      {showIosInstructions && (
        <div className="max-w-xs rounded-xl bg-white p-3 text-xs text-stone-700 shadow-sm">
          <Bi label={{ py: "shǐyòng fēnxiǎng, ránhòu xuǎnzé jiā dào zhǔyèmiàn", en: "Use Share, then Add to Home Screen" }} align="start" />
        </div>
      )}
    </div>
  );
}
