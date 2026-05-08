"use client";

import { useEffect, useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  AdminShell,
  AdminStatusBadge,
  formatAdminDate,
} from "@/components/admin/admin-shell";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { categoryLabelBySlug } from "@/lib/localized-labels";
import { getAdminBookings } from "@/services/admin-service";
import type { AdminBooking } from "@/types/admin";

type StatusFilter = "all" | "pending" | "accepted" | "declined";

export default function AdminBookingsPage() {
  const { language, t } = useI18n();
  const { token } = useAuthToken();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  function loadBookings() {
    if (!token) {
      return;
    }
    setIsLoading(true);
    getAdminBookings(token, {
      q: query.trim() || undefined,
      status: statusFilter,
    })
      .then((nextBookings) => {
        setBookings(nextBookings);
        setError("");
      })
      .catch((caughtError) => {
        setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : t("admin.loadingBookings"),
        );
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(loadBookings, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter]);

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle={t("admin.bookingsSubtitle")}
        title={t("common.bookings")}
      />

      <AdminCard className="mb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex-1 text-[14px] font-semibold text-[#2f3338]">
            {t("common.search")}
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("admin.searchPlaceholderBookings")}
              value={query}
            />
          </label>
          <label className="text-[14px] font-semibold text-[#2f3338]">
            {t("common.status")}
            <select
              className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] md:w-[180px]"
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              value={statusFilter}
            >
              <option value="all">{t("common.all")}</option>
              <option value="pending">{t("status.pending")}</option>
              <option value="accepted">{t("status.accepted")}</option>
              <option value="declined">{t("status.declined")}</option>
            </select>
          </label>
          <AdminButton onClick={loadBookings}>{t("common.apply")}</AdminButton>
        </div>
      </AdminCard>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4">
        {isLoading ? (
          <AdminCard>{t("admin.loadingBookings")}</AdminCard>
        ) : bookings.length === 0 ? (
          <AdminCard>{t("admin.noBookingsFound")}</AdminCard>
        ) : (
          bookings.map((booking) => (
            <AdminCard key={booking.id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[19px] font-extrabold text-black">
                      {categoryLabelBySlug(
                        booking.categorySlug,
                        booking.serviceLabel,
                        language,
                      )}
                    </h2>
                    <AdminStatusBadge status={booking.status} />
                  </div>
                  <p className="mt-2 text-[14px] leading-6 text-[#6d737c]">
                    {t("common.customer")}:{" "}
                    {booking.customerPhone ?? t("common.unavailable")} &bull;{" "}
                    {t("common.provider")}:{" "}
                    {booking.shopCompanyName}
                  </p>
                  <p className="text-[13px] text-[#8a9098]">
                    {t("common.distance")}:{" "}
                    {booking.distanceKm !== null
                      ? `${booking.distanceKm} km`
                      : t("common.unavailable")}{" "}
                    &bull; {t("common.created")} {formatAdminDate(booking.createdAt)}
                  </p>
                </div>
                <p className="rounded-lg bg-[#f5fbfd] px-3 py-2 text-[13px] font-semibold text-[#2f3338]">
                  {booking.providerPhone}
                </p>
              </div>
            </AdminCard>
          ))
        )}
      </div>
    </AdminShell>
  );
}
