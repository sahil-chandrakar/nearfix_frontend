"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminCard,
  AdminPageHeader,
  AdminShell,
  formatAdminDate,
} from "@/components/admin/admin-shell";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import type { TranslationKey } from "@/lib/i18n";
import { ApiError } from "@/lib/http-client";
import { getAdminAuditLogs, getAdminSummary } from "@/services/admin-service";
import type { AdminAuditLog, AdminSummary } from "@/types/admin";
import { BOOKING_NOTIFICATION_EVENT } from "@/types/notifications";

const statItems: { key: keyof AdminSummary; labelKey: TranslationKey; href: string }[] = [
  { key: "pendingProviders", labelKey: "admin.pendingProviders", href: "/admin/providers?status=pending" },
  { key: "pendingDocumentRequests", labelKey: "admin.pendingDocs", href: "/admin/documents?status=pending" },
  { key: "totalBookings", labelKey: "admin.totalBookings", href: "/admin/bookings" },
  { key: "totalCustomers", labelKey: "common.customers", href: "/admin/customers" },
  { key: "approvedProviders", labelKey: "admin.approvedProviders", href: "/admin/providers?status=approved" },
  { key: "activeServices", labelKey: "admin.activeServices", href: "/admin/services" },
  { key: "activeBanners", labelKey: "admin.activeBanners", href: "/admin/banners" },
  { key: "declinedBookings", labelKey: "admin.declinedBookings", href: "/admin/bookings?status=declined" },
];

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const { token } = useAuthToken();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const accessToken = token;
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [nextSummary, nextLogs] = await Promise.all([
          getAdminSummary(accessToken),
          getAdminAuditLogs(accessToken),
        ]);
        if (isMounted) {
          setSummary(nextSummary);
          setAuditLogs(nextLogs.slice(0, 6));
          setLastUpdatedAt(new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }));
          setError("");
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : t("common.dashboard"),
          );
        }
      }
    }

    void loadDashboard();
    const intervalId = window.setInterval(() => {
      void loadDashboard();
    }, 10000);

    function handleRefreshSignal() {
      if (document.visibilityState === "visible") {
        void loadDashboard();
      }
    }

    window.addEventListener("focus", handleRefreshSignal);
    window.addEventListener(BOOKING_NOTIFICATION_EVENT, handleRefreshSignal);
    document.addEventListener("visibilitychange", handleRefreshSignal);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleRefreshSignal);
      window.removeEventListener(BOOKING_NOTIFICATION_EVENT, handleRefreshSignal);
      document.removeEventListener("visibilitychange", handleRefreshSignal);
    };
  }, [t, token]);

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle={t("admin.dashboardSubtitle")}
        title={t("common.dashboard")}
      />

      <p className="-mt-3 mb-5 text-[13px] font-medium text-[#7a7f86]">
        {lastUpdatedAt
          ? t("admin.autoUpdatedAt", { time: lastUpdatedAt })
          : t("admin.loadingCounts")}
      </p>

      {error ? (
        <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => (
          <Link href={item.href} key={item.key}>
            <AdminCard className="transition hover:border-[#f9a21a]">
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#7a7f86]">
                {t(item.labelKey)}
              </p>
              <p className="mt-3 text-[30px] font-extrabold leading-none text-black">
                {summary ? summary[item.key] : "-"}
              </p>
            </AdminCard>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminCard>
          <h2 className="text-[20px] font-extrabold text-black">
            {t("admin.bookingMix")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              [t("status.pending"), summary?.pendingBookings],
              [t("status.accepted"), summary?.acceptedBookings],
              [t("status.declined"), summary?.declinedBookings],
            ].map(([label, value]) => (
              <div className="rounded-lg bg-[#f5fbfd] p-4" key={label as string}>
                <p className="text-[13px] font-semibold text-[#6d737c]">{label}</p>
                <p className="mt-2 text-[24px] font-extrabold text-black">
                  {value ?? "-"}
                </p>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="text-[20px] font-extrabold text-black">
            {t("admin.recentActivity")}
          </h2>
          <div className="mt-4 flex flex-col divide-y divide-[#edf1f3]">
            {auditLogs.length === 0 ? (
              <p className="py-4 text-[14px] text-[#7a7f86]">
                {t("admin.noAudit")}
              </p>
            ) : (
              auditLogs.map((log) => (
                <div className="py-3" key={log.id}>
                  <p className="text-[14px] font-semibold text-[#2f3338]">
                    {log.action.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-[12px] text-[#7a7f86]">
                    {log.targetType} {log.targetId ? `#${log.targetId}` : ""} •{" "}
                    {formatAdminDate(log.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
