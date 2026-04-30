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
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { getAdminBookings } from "@/services/admin-service";
import type { AdminBooking } from "@/types/admin";

type StatusFilter = "all" | "pending" | "accepted" | "declined";

export default function AdminBookingsPage() {
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
            : "Unable to load bookings.",
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
        subtitle="Track customer requests across pending, accepted, and declined states."
        title="Bookings"
      />

      <AdminCard className="mb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex-1 text-[14px] font-semibold text-[#2f3338]">
            Search
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Customer, provider, phone"
              value={query}
            />
          </label>
          <label className="text-[14px] font-semibold text-[#2f3338]">
            Status
            <select
              className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] md:w-[180px]"
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              value={statusFilter}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </select>
          </label>
          <AdminButton onClick={loadBookings}>Apply</AdminButton>
        </div>
      </AdminCard>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4">
        {isLoading ? (
          <AdminCard>Loading bookings...</AdminCard>
        ) : bookings.length === 0 ? (
          <AdminCard>No bookings found.</AdminCard>
        ) : (
          bookings.map((booking) => (
            <AdminCard key={booking.id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[19px] font-extrabold text-black">
                      {booking.serviceLabel}
                    </h2>
                    <AdminStatusBadge status={booking.status} />
                  </div>
                  <p className="mt-2 text-[14px] leading-6 text-[#6d737c]">
                    Customer: {booking.customerPhone ?? "Unavailable"} • Provider:{" "}
                    {booking.shopCompanyName}
                  </p>
                  <p className="text-[13px] text-[#8a9098]">
                    Distance:{" "}
                    {booking.distanceKm !== null
                      ? `${booking.distanceKm} km`
                      : "Unavailable"}{" "}
                    • Created {formatAdminDate(booking.createdAt)}
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
