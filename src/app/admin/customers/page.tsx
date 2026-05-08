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
import { ResetPasswordModal } from "@/components/admin/reset-password-modal";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import {
  getAdminCustomers,
  resetAdminUserPassword,
  updateAdminUserActive,
} from "@/services/admin-service";
import type { AdminCustomer } from "@/types/admin";

export default function AdminCustomersPage() {
  const { t } = useI18n();
  const { token } = useAuthToken();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState<AdminCustomer | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  function loadCustomers() {
    if (!token) {
      return;
    }
    setIsLoading(true);
    getAdminCustomers(token, query.trim() || undefined)
      .then((nextCustomers) => {
        setCustomers(nextCustomers);
        setError("");
      })
      .catch((caughtError) => {
        setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : t("admin.loadingCustomers"),
        );
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(loadCustomers, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function toggleActive(customer: AdminCustomer) {
    if (!token) {
      return;
    }
    try {
      const updated = await updateAdminUserActive(
        token,
        customer.id,
        !customer.isActive,
      );
      setCustomers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setMessage(
        updated.isActive
          ? `${t("common.customer")} ${t("common.unblock")}.`
          : `${t("common.customer")} ${t("common.blocked")}.`,
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
      await resetAdminUserPassword(token, resetTarget.id, newPassword);
      setMessage(`${t("common.resetPassword")}: ${resetTarget.fullName ?? resetTarget.phone ?? t("common.customer")}.`);
      setError("");
      setResetTarget(null);
    } finally {
      setIsResettingPassword(false);
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle={t("admin.customersSubtitle")}
        title={t("common.customers")}
      />

      <AdminCard className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-[14px] font-semibold text-[#2f3338]">
            {t("common.search")}
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("admin.searchPlaceholderCustomers")}
              value={query}
            />
          </label>
          <AdminButton onClick={loadCustomers}>{t("common.apply")}</AdminButton>
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
          <AdminCard>{t("admin.loadingCustomers")}</AdminCard>
        ) : customers.length === 0 ? (
          <AdminCard>{t("admin.noCustomersFound")}</AdminCard>
        ) : (
          customers.map((customer) => (
            <AdminCard key={customer.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[20px] font-extrabold text-black">
                      {customer.fullName ?? t("admin.unnamedCustomer")}
                    </h2>
                    <AdminStatusBadge status={customer.isActive ? "active" : "blocked"} />
                  </div>
                  <p className="mt-2 text-[14px] leading-6 text-[#6d737c]">
                    {customer.phone ?? t("admin.noPhone")} &bull;{" "}
                    {customer.email ?? t("admin.noEmail")}
                  </p>
                  <p className="text-[13px] text-[#8a9098]">
                    {t("common.joined")} {formatAdminDate(customer.createdAt)}
                  </p>
                  {customer.phoneHistory.length > 0 ? (
                    <div className="mt-3 rounded-lg bg-[#f5fbfd] p-3">
                      <p className="text-[13px] font-semibold text-[#2f3338]">
                        {t("admin.phoneHistory")}
                      </p>
                      {customer.phoneHistory.slice(0, 3).map((history) => (
                        <p className="mt-1 text-[12px] text-[#6d737c]" key={history.id}>
                          {history.oldPhone ?? t("common.unavailable")} →{" "}
                          {history.newPhone} &bull;{" "}
                          {formatAdminDate(history.changedAt)}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton
                    onClick={() => toggleActive(customer)}
                    tone={customer.isActive ? "danger" : "primary"}
                  >
                    {customer.isActive ? t("common.block") : t("common.unblock")}
                  </AdminButton>
                  <AdminButton
                    onClick={() => setResetTarget(customer)}
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
        targetLabel={resetTarget?.fullName ?? resetTarget?.phone ?? t("common.customer")}
      />
    </AdminShell>
  );
}
