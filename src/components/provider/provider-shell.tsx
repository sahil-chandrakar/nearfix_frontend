"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { getCurrentUser } from "@/services/auth-service";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type ProviderNavIconName = "new" | "accepted" | "shop";

const providerNavItems = [
  { href: "/provider/dashboard", icon: "new" as const, labelKey: "nav.newBooking" as const },
  {
    href: "/provider/accepted-bookings",
    icon: "accepted" as const,
    labelKey: "common.accepted" as const,
  },
  { href: "/provider/my-shop", icon: "shop" as const, labelKey: "nav.myShop" as const },
];

export function ProviderShell({ children }: { children: ReactNode }) {
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
      router.replace("/provider/login");
      return;
    }

    let isMounted = true;

    getCurrentUser(token)
      .then((user) => {
        if (!isMounted) {
          return;
        }

        if (user.role !== "provider") {
          router.replace("/");
          return;
        }

        setIsAllowed(true);
      })
      .catch(() => {
        if (isMounted) {
          router.replace("/provider/login");
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
        {t("provider.loading")}
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5fbfd] pb-28 sm:min-h-[calc(100vh-5rem)]">
      {children}
      <ProviderBottomNav />
    </main>
  );
}

export function ProviderPageFrame({
  children,
  rightAction,
  title,
}: {
  children: ReactNode;
  rightAction?: ReactNode;
  title: string;
}) {
  return (
    <ProviderShell>
      <div className="border-b border-[#e7ecef] bg-white">
        <div className="mx-auto flex min-h-[72px] w-full max-w-[492px] items-center justify-between px-6 sm:max-w-[536px] sm:min-h-[76px] sm:px-8 md:max-w-[880px] md:px-10">
          <button
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[25px] leading-none text-black transition hover:bg-[#f5f7f8] sm:h-10 sm:w-10"
            onClick={() => window.history.back()}
            type="button"
          >
            <span aria-hidden="true">{"<"}</span>
          </button>
          <h1 className="min-w-0 flex-1 px-3 text-[23px] font-extrabold leading-tight tracking-normal text-[#f9a21a] sm:px-4 sm:text-[27px] md:text-[32px]">
            {title}
          </h1>
          <div className="flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10">
            {rightAction}
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[492px] px-6 pb-10 pt-7 sm:max-w-[536px] sm:px-8 sm:pt-8 md:max-w-[880px] md:px-10">
        {children}
      </div>
    </ProviderShell>
  );
}

export function ProviderCard({ children }: { children: ReactNode }) {
  return (
    <article className="rounded-xl border border-[#e7ecef] bg-white px-5 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.07)] sm:px-6 sm:py-7">
      {children}
    </article>
  );
}

function ProviderBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[1040px] rounded-t-xl bg-[#f9a21a] px-3 pb-2 pt-2 shadow-[0_-2px_12px_rgba(15,23,42,0.12)] sm:bottom-4 sm:rounded-xl sm:px-6">
      <div className="grid grid-cols-3">
        {providerNavItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              className={`flex min-h-[58px] flex-col items-center justify-center gap-1 text-center text-[13px] font-semibold tracking-normal transition sm:text-[14px] ${
                isActive ? "text-white" : "text-black/80"
              }`}
              href={item.href}
              key={item.href}
            >
              <ProviderNavIcon name={item.icon} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function ProviderNavIcon({ name }: { name: ProviderNavIconName }) {
  const className = "h-7 w-7";

  if (name === "accepted") {
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
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6l4 2" />
      </svg>
    );
  }

  if (name === "shop") {
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
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
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
