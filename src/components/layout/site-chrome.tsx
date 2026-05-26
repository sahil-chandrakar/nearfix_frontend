"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { logoutUser } from "@/services/auth-service";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MenuIconName = "home" | "help" | "about" | "logout";

const drawerItems: { href?: string; labelKey: "common.home" | "common.help" | "common.about" | "common.logout"; icon: MenuIconName }[] = [
  { href: "/", labelKey: "common.home", icon: "home" },
  { href: "/help", labelKey: "common.help", icon: "help" },
  { href: "/about", labelKey: "common.about", icon: "about" },
  { labelKey: "common.logout", icon: "logout" },
];

function MenuIcon({ name, className = "" }: { name: MenuIconName; className?: string }) {
  const iconClass = className || "h-8 w-8";

  if (name === "help") {
    return (
      <svg
        aria-hidden="true"
        className={iconClass}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.1"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M9.8 9.4a2.5 2.5 0 0 1 4.6 1.4c0 1.9-2.4 2-2.4 4" />
        <path d="M12 18h.01" />
      </svg>
    );
  }

  if (name === "about") {
    return (
      <svg
        aria-hidden="true"
        className={iconClass}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.1"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg
        aria-hidden="true"
        className={iconClass}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.1"
        viewBox="0 0 24 24"
      >
        <path d="M9 7H5v10h4" />
        <path d="m15 8 4 4-4 4" />
        <path d="M19 12H9" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={iconClass}
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

function TopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { language, t, toggleLanguage } = useI18n();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#edf1f3] bg-white sm:h-20">
      <div className="relative mx-auto flex h-full w-full max-w-[1040px] items-center justify-center px-6">
        <button
          aria-label={t("layout.openMenu")}
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-md text-[#2d3136] transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#f9a21a] sm:left-7 sm:h-11 sm:w-11"
          onClick={onMenuOpen}
          type="button"
        >
          <span className="flex h-5 w-6 flex-col justify-center gap-1 sm:h-6 sm:w-7 sm:gap-[5px]">
            <span className="h-[2.5px] rounded-full bg-current sm:h-[3px]" />
            <span className="h-[2.5px] rounded-full bg-current sm:h-[3px]" />
            <span className="h-[2.5px] rounded-full bg-current sm:h-[3px]" />
          </span>
        </button>

        <Link
          aria-label={t("layout.goHome")}
          className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#f9a21a] focus:ring-offset-4"
          href="/"
        >
          <span className="text-[20px] font-extrabold leading-none tracking-normal text-[#f9a21a] drop-shadow-[0_1px_1px_rgba(249,162,26,0.2)] sm:text-[22px] md:text-[24px]">
            NearFix
          </span>
        </Link>
        <button
          aria-label={t("common.language")}
          className="absolute right-4 flex h-9 min-w-12 items-center justify-center rounded-full border border-[#f3d99b] bg-[#fffaf0] px-3 text-[13px] font-extrabold text-[#d88708] transition hover:bg-[#fff4df] focus:outline-none focus:ring-2 focus:ring-[#f9a21a] sm:right-7 sm:h-10 sm:min-w-14 sm:text-[14px]"
          onClick={toggleLanguage}
          type="button"
        >
          {language === "en" ? "हिं" : "EN"}
        </button>
      </div>
    </header>
  );
}

function SideMenu({
  isLoggedIn,
  isOpen,
  onClose,
  onLogout,
}: {
  isLoggedIn: boolean;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <aside className="relative h-full w-[70vw] min-w-[258px] max-w-[300px] bg-white px-9 pt-20 shadow-[4px_0_20px_rgba(15,23,42,0.16)] sm:w-[300px] sm:px-11 sm:pt-24">
        <button
          aria-label={t("layout.closeMenu")}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[30px] font-light leading-none text-[#33373d] transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#f9a21a] sm:right-6 sm:top-6 sm:h-10 sm:w-10 sm:text-[34px]"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <h2 className="text-[34px] font-extrabold leading-none tracking-normal text-[#f9a21a] drop-shadow-[0_1px_1px_rgba(249,162,26,0.2)] sm:text-[36px]">
          {t("common.menu")}
        </h2>

        <nav aria-label={t("common.menu")} className="mt-14 flex flex-col gap-7 sm:mt-16 sm:gap-8">
          {drawerItems
            .filter((item) => item.labelKey !== "common.logout" || isLoggedIn)
            .map((item) => {
              const isActive = item.href === pathname;
              const label = t(item.labelKey);
              const className = `flex min-h-10 items-center gap-6 text-left text-[22px] font-normal leading-none tracking-normal transition sm:text-[24px] ${
                isActive ? "text-[#f9a21a]" : "text-[#4d525a] hover:text-black"
              }`;

              if (item.href) {
                return (
                  <Link
                    className={className}
                    href={item.href}
                    key={item.labelKey}
                    onClick={onClose}
                  >
                    <MenuIcon className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" name={item.icon} />
                    <span>{label}</span>
                  </Link>
                );
              }

              return (
                <button
                  className={className}
                  key={item.labelKey}
                  onClick={onLogout}
                  type="button"
                >
                  <MenuIcon className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" name={item.icon} />
                  <span>{label}</span>
                </button>
              );
            })}
        </nav>
      </aside>

      <button
        aria-label={t("layout.closeMenu")}
        className="flex-1 bg-black/75"
        onClick={onClose}
        type="button"
      />
    </div>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { clearToken, token } = useAuthToken();

  function handleLogout() {
    if (token) {
      void logoutUser(token).catch(() => {
        // The backend logout endpoint is best-effort because JWTs are client-held.
      });
    }

    clearToken();
    setIsMenuOpen(false);
    window.location.replace("/");
  }

  return (
    <div className="min-h-screen bg-[#f5fbfd] font-sans text-slate-950">
      <TopBar onMenuOpen={() => setIsMenuOpen(true)} />
      <SideMenu
        isLoggedIn={Boolean(token)}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onLogout={handleLogout}
      />
      {children}
    </div>
  );
}
