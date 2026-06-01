"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { env } from "@/config/env";
import { useAuthToken } from "@/hooks/use-auth-token";
import type { TranslationKey } from "@/lib/i18n";
import { categoryLabelBySlug } from "@/lib/localized-labels";
import { getCurrentUser, getProviderProfile } from "@/services/auth-service";
import type { User } from "@/types/auth";
import {
  dispatchBookingNotification,
  isAppNotificationPayload,
  isBookingNotificationPayload,
  type AppNotificationPayload,
} from "@/types/notifications";

type UserRole = User["role"];

type ToastState = {
  body: string;
  href: string;
  id: number;
  title: string;
};

function playNotificationSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.38);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch {
    // Browsers can block audio until the page has a user gesture.
  }
}

function routeForRole(role: UserRole) {
  if (role === "admin") {
    return "/admin/bookings";
  }
  if (role === "provider") {
    return "/provider/dashboard";
  }
  return "/customer/bookings";
}

function routeForNotification(payload: AppNotificationPayload, role: UserRole) {
  if (payload.type === "user_logged_in") {
    return payload.user.role === "customer" ? "/admin/customers" : "/admin/providers";
  }

  return routeForRole(role);
}

function notificationCopy(
  payload: AppNotificationPayload,
  role: UserRole,
  language: "en" | "hi",
  t: (key: TranslationKey, values?: Record<string, string | number>) => string,
) {
  if (payload.type === "user_logged_in") {
    const roleLabel = payload.user.role === "customer" ? "Customer" : "Provider";
    return {
      title: "User logged in",
      body: `${roleLabel} logged in: ${payload.user.displayName}`,
    };
  }

  const service = categoryLabelBySlug(
    payload.booking.categorySlug,
    payload.booking.serviceLabel,
    language,
  );
  const customer = payload.booking.customerPhone ?? t("common.customer");
  const provider = payload.booking.shopCompanyName;

  if (payload.type === "booking_created") {
    if (role === "admin") {
      return {
        title: `${t("common.bookings")}: ${t("status.pending")}`,
        body: `${service} - ${customer} / ${provider}`,
      };
    }

    return {
      title: t("provider.newBookingReceived"),
      body: t("provider.newBookingFrom", { service, customer }),
    };
  }

  const statusKey = `status.${payload.booking.status}` as TranslationKey;
  const statusLabel = t(statusKey);
  return {
    title: `${t("common.bookings")}: ${statusLabel}`,
    body:
      role === "customer"
        ? `${provider} - ${service}`
        : `${service} - ${customer} / ${provider}`,
  };
}

export function BookingNotificationCenter() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, t } = useI18n();
  const { token } = useAuthToken();
  const [canConnect, setCanConnect] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>(() =>
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "default",
    );
  const [toast, setToast] = useState<ToastState | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const notificationSupported =
    typeof window !== "undefined" && "Notification" in window;

  useEffect(() => {
    let isMounted = true;
    const resetTimer = window.setTimeout(() => {
      if (isMounted) {
        setCanConnect(false);
        setUserRole(null);
      }
    }, 0);

    const accessToken = token ?? "";
    if (!accessToken) {
      return () => {
        isMounted = false;
        window.clearTimeout(resetTimer);
      };
    }

    async function loadUser() {
      try {
        const user = await getCurrentUser(accessToken);
        if (!isMounted) {
          return;
        }

        setUserRole(user.role);
        if (user.role !== "provider") {
          setCanConnect(true);
          return;
        }

        const profile = await getProviderProfile(accessToken);
        if (isMounted) {
          setCanConnect(profile.verificationStatus === "approved");
        }
      } catch {
        if (isMounted) {
          setCanConnect(false);
          setUserRole(null);
        }
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
      window.clearTimeout(resetTimer);
    };
  }, [token]);

  const isInRoleArea = useMemo(() => {
    if (userRole === "admin") {
      return pathname.startsWith("/admin");
    }
    if (userRole === "provider") {
      return pathname.startsWith("/provider");
    }
    if (userRole === "customer") {
      return pathname.startsWith("/customer");
    }
    return false;
  }, [pathname, userRole]);

  useEffect(() => {
    const accessToken = token ?? "";
    if (!accessToken || !canConnect || userRole === null) {
      return;
    }
    const activeRole = userRole as UserRole;

    let shouldReconnect = true;
    let reconnectDelayMs = 1500;
    let reconnectTimer: number | null = null;
    let socket: WebSocket | null = null;

    function clearReconnectTimer() {
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    }

    function showBrowserNotification(toastState: ToastState) {
      if (
        !notificationSupported ||
        notificationPermission !== "granted" ||
        document.visibilityState === "visible"
      ) {
        return;
      }

      try {
        const browserNotification = new Notification(toastState.title, {
          body: toastState.body,
          icon: "/icon-192.png",
          tag: toastState.href,
        });
        browserNotification.onclick = () => {
          window.focus();
          router.push(toastState.href);
          browserNotification.close();
        };
      } catch {
        // Browser notification support can still fail on unsupported origins.
      }
    }

    function handlePayload(payload: AppNotificationPayload) {
      const copy = notificationCopy(payload, activeRole, language, t);
      const nextToast = {
        ...copy,
        href: routeForNotification(payload, activeRole),
        id: Date.now(),
      };

      setToast(nextToast);
      showBrowserNotification(nextToast);

      if (isBookingNotificationPayload(payload)) {
        window.setTimeout(() => dispatchBookingNotification(payload), 0);
      }
      playNotificationSound();
    }

    function openSocket() {
      socket = new WebSocket(
        `${env.wsBaseUrl}/notifications/bookings/ws?token=${encodeURIComponent(
          accessToken,
        )}`,
      );

      socket.onopen = () => {
        reconnectDelayMs = 1500;
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as unknown;
          if (isAppNotificationPayload(payload)) {
            handlePayload(payload);
          }
        } catch {
          // Ignore malformed WebSocket payloads.
        }
      };

      socket.onerror = () => {
        socket?.close();
      };

      socket.onclose = () => {
        socket = null;
        if (!shouldReconnect) {
          return;
        }

        clearReconnectTimer();
        reconnectTimer = window.setTimeout(openSocket, reconnectDelayMs);
        reconnectDelayMs = Math.min(reconnectDelayMs * 2, 10000);
      };
    }

    openSocket();

    return () => {
      shouldReconnect = false;
      clearReconnectTimer();
      socket?.close();
    };
  }, [
    canConnect,
    language,
    notificationPermission,
    notificationSupported,
    router,
    t,
    token,
    userRole,
  ]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function enableNotifications() {
    if (!notificationSupported) {
      return;
    }

    const nextPermission = await Notification.requestPermission();
    setNotificationPermission(nextPermission);
  }

  const shouldShowPermissionBanner =
    Boolean(token) &&
    canConnect &&
    isInRoleArea &&
    notificationSupported &&
    notificationPermission === "default" &&
    !isBannerDismissed;

  return (
    <>
      {shouldShowPermissionBanner ? (
        <div className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-[520px] rounded-xl border border-[#f3d99b] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.18)] sm:bottom-8 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[15px] font-extrabold text-black">
                Enable browser notifications
              </p>
              <p className="mt-1 text-[13px] leading-5 text-[#6d737c]">
                Get booking and account updates while NearFix is open.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                className="h-10 rounded-lg border border-[#e7ecef] px-3 text-[13px] font-semibold text-[#4d525a] transition hover:bg-[#f7f8f9]"
                onClick={() => setIsBannerDismissed(true)}
                type="button"
              >
                Later
              </button>
              <button
                className="h-10 rounded-lg bg-[#f9a21a] px-3 text-[13px] font-semibold text-white transition hover:bg-[#ee9914]"
                onClick={enableNotifications}
                type="button"
              >
                {t("common.enable")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className="fixed left-4 right-4 top-24 z-[60] mx-auto max-w-[460px] rounded-xl border border-[#f3d99b] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.18)]"
          data-testid="booking-notification-toast"
          key={toast.id}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <button
              className="min-w-0 flex-1 text-left"
              onClick={() => {
                router.push(toast.href);
                setToast(null);
              }}
              type="button"
            >
              <p className="text-[15px] font-semibold text-[#f9a21a]">
                {toast.title}
              </p>
              <p className="mt-1 text-[15px] leading-5 text-[#4d525a]">
                {toast.body}
              </p>
            </button>
            <button
              aria-label={t("common.close")}
              className="text-[24px] leading-none text-[#6d737c]"
              onClick={() => setToast(null)}
              type="button"
            >
              &times;
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
