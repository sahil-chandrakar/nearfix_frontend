"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const DISMISSED_AT_KEY = "nearfix-pwa-install-dismissed-at";
const DISMISS_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

function isRunningInstalledApp() {
  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function wasDismissedRecently() {
  const dismissedAt = Number(window.localStorage.getItem(DISMISSED_AT_KEY) || "0");
  return dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_PERIOD_MS;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIosBrowser, setIsIosBrowser] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (isRunningInstalledApp()) {
      return;
    }

    const browserDetectionTimer = window.setTimeout(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(userAgent);

      setIsIosBrowser(isIos);

      if (isIos && !wasDismissedRecently()) {
        setIsVisible(true);
      }
    }, 0);

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);

      if (!wasDismissedRecently()) {
        setIsVisible(true);
      }
    }

    function handleAppInstalled() {
      setDeferredPrompt(null);
      setIsVisible(false);
      window.localStorage.removeItem(DISMISSED_AT_KEY);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.clearTimeout(browserDetectionTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "dismissed") {
        window.localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
      }

      setDeferredPrompt(null);
      setIsVisible(false);
    } finally {
      setIsInstalling(false);
    }
  }

  function handleDismiss() {
    window.localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  const canUseNativePrompt = Boolean(deferredPrompt);

  return (
    <aside
      aria-label="Install NearFix"
      className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-[420px] rounded-lg border border-[#f1d9a8] bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.18)] sm:bottom-6"
    >
      <div className="flex items-start gap-3">
        <Image
          alt=""
          className="h-11 w-11 rounded-lg"
          height={44}
          priority={false}
          src="/icon-192.png"
          width={44}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold leading-5 text-[#1f252b]">
            Install NearFix
          </p>
          <p className="mt-1 text-[13px] leading-5 text-[#5f6872]">
            {isIosBrowser && !canUseNativePrompt
              ? "Open Share, then choose Add to Home Screen."
              : "Get faster access from your phone home screen."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {canUseNativePrompt ? (
              <button
                className="min-h-10 rounded-md bg-[#f9a21a] px-4 text-[14px] font-bold text-white transition hover:bg-[#ee9914] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isInstalling}
                onClick={handleInstallClick}
                type="button"
              >
                {isInstalling ? "Opening..." : "Install"}
              </button>
            ) : null}
            <button
              className="min-h-10 rounded-md border border-[#e7ecef] px-4 text-[14px] font-bold text-[#4d525a] transition hover:border-[#f9a21a]"
              onClick={handleDismiss}
              type="button"
            >
              Later
            </button>
          </div>
        </div>
        <button
          aria-label="Close install prompt"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[22px] leading-none text-[#606872] transition hover:bg-[#f7fafb] focus:outline-none focus:ring-2 focus:ring-[#f9a21a]"
          onClick={handleDismiss}
          type="button"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </aside>
  );
}
