"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { getCurrentUser } from "@/services/auth-service";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function BottomIcon({ name }: { name: "home" | "booking" | "profile" }) {
  const className = "h-7 w-7";

  if (name === "booking") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.1"
        viewBox="0 0 24 24"
      >
        <rect height="18" rx="2" width="12" x="6" y="3" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h3" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.1"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="8" r="3" />
        <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.1"
      viewBox="0 0 24 24"
    >
      <path d="m4 10 8-7 8 7" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

const bottomNavItems = [
  { href: "/customer/home", icon: "home" as const, labelKey: "common.home" as const },
  { href: "/customer/bookings", icon: "booking" as const, labelKey: "nav.myBooking" as const },
  { href: "/customer/profile", icon: "profile" as const, labelKey: "nav.myProfile" as const },
];

export function CustomerShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { t } = useI18n();
  const { isReady, token } = useAuthToken();
  const [isAllowed, setIsAllowed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!token) {
      router.replace("/customer/login");
      return;
    }

    let isMounted = true;

    getCurrentUser(token)
      .then((user) => {
        if (!isMounted) {
          return;
        }

        if (user.role !== "customer") {
          router.replace("/");
          return;
        }

        setIsAllowed(true);
      })
      .catch(() => {
        if (isMounted) {
          router.replace("/customer/login");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsChecking(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isReady, router, token]);

  if (!isReady || !token || isChecking || !isAllowed) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f5fbfd] px-6 text-center text-[17px] leading-7 text-[#6d737c] sm:min-h-[calc(100vh-5rem)]">
        {t("common.loading")}
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5fbfd] pb-28 sm:min-h-[calc(100vh-5rem)]">
      {children}
      <CustomerBottomNav />
    </main>
  );
}

function CustomerBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[1040px] rounded-t-xl bg-[#f9a21a] px-3 pb-2 pt-2 shadow-[0_-2px_12px_rgba(15,23,42,0.12)] sm:bottom-4 sm:rounded-xl sm:px-6">
      <div className="grid grid-cols-3">
        {bottomNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/customer/home" && pathname.startsWith("/customer/services"));

          return (
            <Link
              className={`flex min-h-[58px] flex-col items-center justify-center gap-1 text-center text-[13px] font-semibold tracking-normal transition sm:text-[14px] ${
                isActive ? "text-white" : "text-black/80"
              }`}
              href={item.href}
              key={item.href}
            >
              <BottomIcon name={item.icon} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
