"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminCard,
  AdminPageHeader,
  AdminShell,
  formatAdminDate,
} from "@/components/admin/admin-shell";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { getAdminAuditLogs, getAdminSummary } from "@/services/admin-service";
import type { AdminAuditLog, AdminSummary } from "@/types/admin";

const statItems: { key: keyof AdminSummary; label: string; href: string }[] = [
  { key: "pendingProviders", label: "Pending Providers", href: "/admin/providers?status=pending" },
  { key: "pendingDocumentRequests", label: "Pending Docs", href: "/admin/documents?status=pending" },
  { key: "totalBookings", label: "Total Bookings", href: "/admin/bookings" },
  { key: "totalCustomers", label: "Customers", href: "/admin/customers" },
  { key: "approvedProviders", label: "Approved Providers", href: "/admin/providers?status=approved" },
  { key: "activeServices", label: "Active Services", href: "/admin/services" },
  { key: "activeBanners", label: "Active Banners", href: "/admin/banners" },
  { key: "declinedBookings", label: "Declined Bookings", href: "/admin/bookings?status=declined" },
];

export default function AdminDashboardPage() {
  const { token } = useAuthToken();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    Promise.all([getAdminSummary(token), getAdminAuditLogs(token)])
      .then(([nextSummary, nextLogs]) => {
        if (!isMounted) {
          return;
        }
        setSummary(nextSummary);
        setAuditLogs(nextLogs.slice(0, 6));
        setError("");
      })
      .catch((caughtError) => {
        if (isMounted) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Unable to load dashboard.",
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle="Review marketplace health, pending approvals, and recent admin activity."
        title="Dashboard"
      />

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
                {item.label}
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
          <h2 className="text-[20px] font-extrabold text-black">Booking Mix</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["Pending", summary?.pendingBookings],
              ["Accepted", summary?.acceptedBookings],
              ["Declined", summary?.declinedBookings],
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
          <h2 className="text-[20px] font-extrabold text-black">Recent Activity</h2>
          <div className="mt-4 flex flex-col divide-y divide-[#edf1f3]">
            {auditLogs.length === 0 ? (
              <p className="py-4 text-[14px] text-[#7a7f86]">No audit activity yet.</p>
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
