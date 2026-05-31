"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthToken } from "@/hooks/use-auth-token";
import { getCurrentUser } from "@/services/auth-service";

type AdminNavIcon =
  | "dashboard"
  | "providers"
  | "documents"
  | "customers"
  | "bookings"
  | "banners"
  | "services"
  | "brands"
  | "support"
  | "audit";

const navItems = [
  { href: "/admin/dashboard", icon: "dashboard" as const, labelKey: "common.dashboard" as const },
  { href: "/admin/providers", icon: "providers" as const, labelKey: "common.providers" as const },
  { href: "/admin/documents", icon: "documents" as const, labelKey: "common.documents" as const },
  { href: "/admin/customers", icon: "customers" as const, labelKey: "common.customers" as const },
  { href: "/admin/bookings", icon: "bookings" as const, labelKey: "common.bookings" as const },
  { href: "/admin/banners", icon: "banners" as const, labelKey: "nav.banners" as const },
  { href: "/admin/services", icon: "services" as const, labelKey: "common.services" as const },
  { href: "/admin/brands", icon: "brands" as const, labelKey: "nav.brandServices" as const },
  { href: "/admin/support", icon: "support" as const, labelKey: "nav.support" as const },
  { href: "/admin/audit-logs", icon: "audit" as const, labelKey: "nav.audit" as const },
];

function AdminIcon({ name }: { name: AdminNavIcon }) {
  const common = {
    "aria-hidden": true,
    className: "h-5 w-5 shrink-0",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: "2",
    viewBox: "0 0 24 24",
  };

  if (name === "providers" || name === "customers") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-1a6 6 0 0 1 12 0v1" />
        <path d="M16 11a3 3 0 0 0 0-6" />
        <path d="M21 20v-1a5 5 0 0 0-3-4.6" />
      </svg>
    );
  }

  if (name === "documents") {
    return (
      <svg {...common}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </svg>
    );
  }

  if (name === "bookings") {
    return (
      <svg {...common}>
        <rect height="18" rx="2" width="14" x="5" y="3" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    );
  }

  if (name === "banners") {
    return (
      <svg {...common}>
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="m7 15 3-3 2 2 3-4 2 5" />
      </svg>
    );
  }

  if (name === "services") {
    return (
      <svg {...common}>
        <path d="M12 3v18" />
        <path d="M3 12h18" />
      </svg>
    );
  }

  if (name === "brands") {
    return (
      <svg {...common}>
        <path d="M4 9h16" />
        <path d="M5 9l1-4h12l1 4" />
        <path d="M6 9v10h12V9" />
        <path d="M9 19v-5h6v5" />
      </svg>
    );
  }

  if (name === "audit") {
    return (
      <svg {...common}>
        <path d="M4 4h16" />
        <path d="M4 9h16" />
        <path d="M4 14h10" />
        <path d="M4 19h8" />
      </svg>
    );
  }

  if (name === "support") {
    return (
      <svg {...common}>
        <path d="M4 12a8 8 0 0 1 16 0" />
        <path d="M4 12v4a2 2 0 0 0 2 2h1v-8H6a2 2 0 0 0-2 2Z" />
        <path d="M20 12v4a2 2 0 0 1-2 2h-1v-8h1a2 2 0 0 1 2 2Z" />
        <path d="M8 18a4 4 0 0 0 8 0" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect height="7" rx="1.5" width="7" x="3" y="3" />
      <rect height="7" rx="1.5" width="7" x="14" y="3" />
      <rect height="7" rx="1.5" width="7" x="3" y="14" />
      <rect height="7" rx="1.5" width="7" x="14" y="14" />
    </svg>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const { isReady, token } = useAuthToken();
  const [isAllowed, setIsAllowed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!token) {
      router.replace("/nearfix-admin-login");
      return;
    }

    let isMounted = true;
    getCurrentUser(token)
      .then((user) => {
        if (!isMounted) {
          return;
        }
        if (user.role !== "admin") {
          router.replace("/");
          return;
        }
        setIsAllowed(true);
      })
      .catch(() => {
        if (isMounted) {
          router.replace("/nearfix-admin-login");
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
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 text-center text-[16px] text-[#6d737c]">
        {t("admin.loading")}
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5fbfd] sm:min-h-[calc(100vh-5rem)]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:flex-row lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:h-fit lg:w-[236px] lg:shrink-0">
          <nav className="flex gap-2 overflow-x-auto rounded-xl border border-[#e7ecef] bg-white p-2 shadow-[0_2px_12px_rgba(15,23,42,0.06)] lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] font-semibold tracking-normal transition lg:text-[14px] ${
                    isActive
                      ? "bg-[#fff4df] text-[#d88708]"
                      : "text-[#4d525a] hover:bg-[#f7fafb] hover:text-black"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <AdminIcon name={item.icon} />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}

export function AdminPageHeader({
  action,
  subtitle,
  title,
}: {
  action?: ReactNode;
  subtitle?: string;
  title: string;
}) {
  const { t } = useI18n();

  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#d88708]">
          {t("common.admin")}
        </p>
        <h1 className="mt-1 text-[27px] font-extrabold leading-tight tracking-normal text-black sm:text-[32px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-[#6d737c] sm:text-[15px]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-[#e7ecef] bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.06)] sm:p-5 ${className}`}>
      {children}
    </section>
  );
}

export function AdminButton({
  children,
  tone = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "danger";
}) {
  const className =
    tone === "danger"
      ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
      : tone === "secondary"
        ? "border border-[#e7ecef] bg-white text-[#2f3338] hover:border-[#f9a21a]"
        : "bg-[#f9a21a] text-white hover:bg-[#ee9914]";

  return (
    <button
      {...props}
      className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-[14px] font-semibold tracking-normal transition disabled:cursor-not-allowed disabled:opacity-60 ${className} ${props.className ?? ""}`}
      type={props.type ?? "button"}
    >
      {children}
    </button>
  );
}

export function AdminStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const className =
    status === "approved" || status === "accepted" || status === "active"
      ? "bg-[#defde7] text-[#2aa946]"
      : status === "rejected" || status === "declined" || status === "blocked"
        ? "bg-red-50 text-red-600"
        : "bg-[#fff4df] text-[#d88708]";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${className}`}>
      {t(`status.${status}` as TranslationKey)}
    </span>
  );
}

export function formatAdminDate(value: string | null | undefined) {
  if (!value) {
    return "Unavailable";
  }
  return new Date(value).toLocaleString();
}
