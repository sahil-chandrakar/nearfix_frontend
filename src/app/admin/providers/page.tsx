"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import {
  getAdminProviders,
  updateAdminUserActive,
  updateAdminProviderStatus,
} from "@/services/admin-service";
import type { AdminProvider } from "@/types/admin";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminProvidersPage() {
  const { token } = useAuthToken();
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  function loadProviders() {
    if (!token) {
      return;
    }

    setIsLoading(true);
    getAdminProviders(token, { q: query.trim() || undefined, status: statusFilter })
      .then((nextProviders) => {
        setProviders(nextProviders);
        setError("");
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Unable to load providers.",
        );
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(loadProviders, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter]);

  async function reviewProvider(
    provider: AdminProvider,
    verificationStatus: "approved" | "rejected",
  ) {
    if (!token) {
      return;
    }

    const reason =
      verificationStatus === "rejected"
        ? window.prompt("Enter rejection reason for provider:")
        : undefined;
    if (verificationStatus === "rejected" && !reason?.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      const updated = await updateAdminProviderStatus(token, provider.id, {
        reason: reason?.trim(),
        verificationStatus,
      });
      setProviders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setMessage(
        verificationStatus === "approved"
          ? "Provider approved."
          : "Provider rejected.",
      );
      setError("");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to review provider.",
      );
    }
  }

  async function toggleProviderActive(provider: AdminProvider) {
    if (!token) {
      return;
    }
    try {
      await updateAdminUserActive(token, provider.userId, !provider.userIsActive);
      setProviders((current) =>
        current.map((item) =>
          item.id === provider.id
            ? { ...item, userIsActive: !provider.userIsActive }
            : item,
        ),
      );
      setMessage(provider.userIsActive ? "Provider suspended." : "Provider restored.");
      setError("");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update provider account.",
      );
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle="Approve, reject, search, and inspect provider shops."
        title="Providers"
      />

      <AdminCard className="mb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex-1 text-[14px] font-semibold text-[#2f3338]">
            Search
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Shop, owner, phone, email"
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <AdminButton onClick={loadProviders}>Apply</AdminButton>
        </div>
      </AdminCard>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-lg bg-[#defde7] px-4 py-3 text-[14px] text-[#2aa946]">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4">
        {isLoading ? (
          <AdminCard>Loading providers...</AdminCard>
        ) : providers.length === 0 ? (
          <AdminCard>No providers found.</AdminCard>
        ) : (
          providers.map((provider) => (
            <AdminCard key={provider.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[20px] font-extrabold text-black">
                      {provider.shopCompanyName}
                    </h2>
                    <AdminStatusBadge status={provider.verificationStatus} />
                    <AdminStatusBadge status={provider.userIsActive ? "active" : "blocked"} />
                  </div>
                  <p className="mt-2 text-[14px] leading-6 text-[#6d737c]">
                    {provider.ownerName} • {provider.whatsappMobileNumber} • {provider.email}
                  </p>
                  <p className="mt-1 text-[13px] text-[#8a9098]">
                    Categories: {provider.categorySlugs.length || 0} • Registered{" "}
                    {formatAdminDate(provider.createdAt)}
                  </p>
                  {provider.rejectionReason ? (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
                      Rejection: {provider.rejectionReason}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#e7ecef] px-4 text-[14px] font-semibold text-[#2f3338] transition hover:border-[#f9a21a]"
                    href={`/admin/providers/${provider.id}`}
                  >
                    View
                  </Link>
                  <AdminButton
                    disabled={provider.verificationStatus === "approved"}
                    onClick={() => reviewProvider(provider, "approved")}
                  >
                    Approve
                  </AdminButton>
                  <AdminButton
                    disabled={provider.verificationStatus === "rejected"}
                    onClick={() => reviewProvider(provider, "rejected")}
                    tone="danger"
                  >
                    Reject
                  </AdminButton>
                  <AdminButton
                    onClick={() => toggleProviderActive(provider)}
                    tone={provider.userIsActive ? "danger" : "secondary"}
                  >
                    {provider.userIsActive ? "Suspend" : "Restore"}
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          ))
        )}
      </div>
    </AdminShell>
  );
}
