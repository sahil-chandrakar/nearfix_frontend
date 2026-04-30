"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  AdminShell,
  AdminStatusBadge,
} from "@/components/admin/admin-shell";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import {
  createAdminService,
  getAdminServices,
  updateAdminService,
} from "@/services/admin-service";
import type { AdminService } from "@/types/admin";

export default function AdminServicesPage() {
  const { token } = useAuthToken();
  const [services, setServices] = useState<AdminService[]>([]);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  function loadServices() {
    if (!token) {
      return;
    }
    setIsLoading(true);
    getAdminServices(token)
      .then((nextServices) => {
        setServices(nextServices);
        setError("");
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Unable to load services.",
        );
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(loadServices, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !label.trim()) {
      return;
    }
    setIsCreating(true);
    setError("");
    try {
      const created = await createAdminService(token, label.trim());
      setServices((current) => [...current, created]);
      setLabel("");
      setMessage("Service added to Other Services.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to add service.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function toggleService(service: AdminService) {
    if (!token || service.id === null) {
      return;
    }
    const updated = await updateAdminService(token, service.id, {
      isActive: !service.isActive,
    });
    setServices((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  async function updateOrder(service: AdminService, displayOrder: number) {
    if (!token || service.id === null) {
      return;
    }
    const updated = await updateAdminService(token, service.id, { displayOrder });
    setServices((current) =>
      current
        .map((item) => (item.id === updated.id ? updated : item))
        .sort((a, b) => a.displayOrder - b.displayOrder),
    );
  }

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle="Add new customer-facing services. New services always appear under Other Services."
        title="Services"
      />

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

      <AdminCard className="mb-5">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleCreate}>
          <label className="flex-1 text-[14px] font-semibold text-[#2f3338]">
            New Other Service
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
              onChange={(event) => setLabel(event.target.value)}
              placeholder="e.g., Solar Panel Cleaning"
              value={label}
            />
          </label>
          <AdminButton disabled={isCreating} type="submit">
            {isCreating ? "Adding..." : "Add Service"}
          </AdminButton>
        </form>
      </AdminCard>

      <div className="grid gap-4">
        {isLoading ? (
          <AdminCard>Loading services...</AdminCard>
        ) : (
          services.map((service) => (
            <AdminCard key={service.slug}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[18px] font-extrabold text-black">
                      {service.label}
                    </h2>
                    <AdminStatusBadge status={service.isActive ? "active" : "blocked"} />
                  </div>
                  <p className="mt-2 text-[13px] text-[#6d737c]">
                    {service.group} • {service.slug}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-[13px] font-semibold text-[#6d737c]">
                    Order
                    <input
                      className="ml-2 h-9 w-20 rounded-lg border border-[#e7ecef] px-3 text-[13px]"
                      min={0}
                      onBlur={(event) =>
                        updateOrder(service, Number(event.target.value))
                      }
                      type="number"
                      defaultValue={service.displayOrder}
                    />
                  </label>
                  <AdminButton onClick={() => toggleService(service)} tone="secondary">
                    {service.isActive ? "Disable" : "Enable"}
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
