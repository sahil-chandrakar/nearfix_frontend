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
import {
  getAdminCustomers,
  updateAdminUserActive,
} from "@/services/admin-service";
import type { AdminCustomer } from "@/types/admin";

export default function AdminCustomersPage() {
  const { token } = useAuthToken();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
            : "Unable to load customers.",
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
      setMessage(updated.isActive ? "Customer unblocked." : "Customer blocked.");
      setError("");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update customer.",
      );
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle="Search customers, review phone history, and block suspicious accounts."
        title="Customers"
      />

      <AdminCard className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-[14px] font-semibold text-[#2f3338]">
            Search
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, phone, email"
              value={query}
            />
          </label>
          <AdminButton onClick={loadCustomers}>Apply</AdminButton>
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
          <AdminCard>Loading customers...</AdminCard>
        ) : customers.length === 0 ? (
          <AdminCard>No customers found.</AdminCard>
        ) : (
          customers.map((customer) => (
            <AdminCard key={customer.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[20px] font-extrabold text-black">
                      {customer.fullName ?? "Unnamed Customer"}
                    </h2>
                    <AdminStatusBadge status={customer.isActive ? "active" : "blocked"} />
                  </div>
                  <p className="mt-2 text-[14px] leading-6 text-[#6d737c]">
                    {customer.phone ?? "No phone"} • {customer.email ?? "No email"}
                  </p>
                  <p className="text-[13px] text-[#8a9098]">
                    Joined {formatAdminDate(customer.createdAt)}
                  </p>
                  {customer.phoneHistory.length > 0 ? (
                    <div className="mt-3 rounded-lg bg-[#f5fbfd] p-3">
                      <p className="text-[13px] font-semibold text-[#2f3338]">
                        Phone history
                      </p>
                      {customer.phoneHistory.slice(0, 3).map((history) => (
                        <p className="mt-1 text-[12px] text-[#6d737c]" key={history.id}>
                          {history.oldPhone ?? "None"} → {history.newPhone} •{" "}
                          {formatAdminDate(history.changedAt)}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
                <AdminButton
                  onClick={() => toggleActive(customer)}
                  tone={customer.isActive ? "danger" : "primary"}
                >
                  {customer.isActive ? "Block" : "Unblock"}
                </AdminButton>
              </div>
            </AdminCard>
          ))
        )}
      </div>
    </AdminShell>
  );
}
