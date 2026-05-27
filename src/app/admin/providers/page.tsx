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
import { RejectionReasonModal } from "@/components/admin/rejection-reason-modal";
import { ResetPasswordModal } from "@/components/admin/reset-password-modal";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import {
  getAdminProviders,
  resetAdminUserPassword,
  updateAdminUserActive,
  updateAdminProviderStatus,
} from "@/services/admin-service";
import type { AdminProvider } from "@/types/admin";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminProvidersPage() {
  const { t } = useI18n();
  const { token } = useAuthToken();
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewingProvider, setIsReviewingProvider] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<AdminProvider | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminProvider | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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
              : t("admin.loadingProviders"),
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
    reason?: string,
  ) {
    if (!token) {
      return;
    }

    if (verificationStatus === "rejected" && !reason?.trim()) {
      setError(t("admin.rejectionReasonRequired"));
      return;
    }

    setIsReviewingProvider(true);
    try {
      const updated = await updateAdminProviderStatus(token, provider.id, {
        reason: reason?.trim(),
        verificationStatus,
      });
      setProviders((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .filter(
            (item) =>
              statusFilter === "all" ||
              item.verificationStatus === statusFilter,
          ),
      );
      setMessage(
        verificationStatus === "approved"
          ? t("admin.providerApproved")
          : t("admin.providerRejected"),
      );
      setError("");
      setRejectTarget(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : t("common.update"),
      );
      throw caughtError;
    } finally {
      setIsReviewingProvider(false);
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
      setMessage(
        provider.userIsActive
          ? t("admin.providerSuspended")
          : t("admin.providerRestored"),
      );
      setError("");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : t("common.update"),
      );
    }
  }

  async function handlePasswordReset(newPassword: string) {
    if (!token || !resetTarget) {
      return;
    }
    setIsResettingPassword(true);
    try {
      await resetAdminUserPassword(token, resetTarget.userId, newPassword);
      setMessage(`${t("common.resetPassword")}: ${resetTarget.shopCompanyName}.`);
      setError("");
      setResetTarget(null);
    } finally {
      setIsResettingPassword(false);
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle={t("admin.providersSubtitle")}
        title={t("common.providers")}
      />

      <AdminCard className="mb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex-1 text-[14px] font-semibold text-[#2f3338]">
            {t("common.search")}
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("admin.searchPlaceholderProviders")}
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
              <option value="approved">{t("status.approved")}</option>
              <option value="rejected">{t("status.rejected")}</option>
            </select>
          </label>
          <AdminButton onClick={loadProviders}>{t("common.apply")}</AdminButton>
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
          <AdminCard>{t("admin.loadingProviders")}</AdminCard>
        ) : providers.length === 0 ? (
          <AdminCard>{t("admin.noProvidersFound")}</AdminCard>
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
                    {t("common.categories")}: {provider.categorySlugs.length || 0} &bull;{" "}
                    {t("admin.registered")}{" "}
                    {formatAdminDate(provider.createdAt)}
                  </p>
                  {provider.rejectionReason ? (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
                      {t("admin.rejection")}: {provider.rejectionReason}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#e7ecef] px-4 text-[14px] font-semibold text-[#2f3338] transition hover:border-[#f9a21a]"
                    href={`/admin/providers/${provider.id}`}
                  >
                    {t("common.view")}
                  </Link>
                  <AdminButton
                    disabled={provider.verificationStatus === "approved"}
                    onClick={() =>
                      void reviewProvider(provider, "approved").catch(
                        () => undefined,
                      )
                    }
                  >
                    {t("common.approve")}
                  </AdminButton>
                  <AdminButton
                    disabled={provider.verificationStatus === "rejected"}
                    onClick={() => setRejectTarget(provider)}
                    tone="danger"
                  >
                    {t("common.reject")}
                  </AdminButton>
                  <AdminButton
                    onClick={() => toggleProviderActive(provider)}
                    tone={provider.userIsActive ? "danger" : "secondary"}
                  >
                    {provider.userIsActive ? t("common.suspend") : t("common.restore")}
                  </AdminButton>
                  <AdminButton
                    onClick={() => setResetTarget(provider)}
                    tone="secondary"
                  >
                    {t("common.resetPassword")}
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          ))
        )}
      </div>

      <ResetPasswordModal
        isOpen={resetTarget !== null}
        isSubmitting={isResettingPassword}
        onClose={() => setResetTarget(null)}
        onSubmit={handlePasswordReset}
        targetLabel={resetTarget?.shopCompanyName ?? t("common.provider")}
      />
      <RejectionReasonModal
        description={t("admin.enterProviderRejectionReason")}
        isOpen={rejectTarget !== null}
        isSubmitting={isReviewingProvider}
        onClose={() => setRejectTarget(null)}
        onSubmit={(reason) =>
          rejectTarget
            ? reviewProvider(rejectTarget, "rejected", reason)
            : Promise.resolve()
        }
        targetLabel={rejectTarget?.shopCompanyName ?? t("common.provider")}
        title={t("common.reject")}
      />
    </AdminShell>
  );
}
