"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  AdminShell,
  AdminStatusBadge,
} from "@/components/admin/admin-shell";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import {
  createAdminService,
  getAdminServices,
  updateAdminService,
} from "@/services/admin-service";
import type { AdminService } from "@/types/admin";

export default function AdminServicesPage() {
  const { language, t } = useI18n();
  const { token } = useAuthToken();
  const [services, setServices] = useState<AdminService[]>([]);
  const [label, setLabel] = useState("");
  const [labelHi, setLabelHi] = useState("");
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
            : t("admin.loadingServices"),
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
    if (!token || !label.trim() || !labelHi.trim()) {
      return;
    }

    setIsCreating(true);
    setError("");
    try {
      const created = await createAdminService(token, {
        label: label.trim(),
        labelHi: labelHi.trim(),
      });
      setServices((current) => [...current, created]);
      setLabel("");
      setLabelHi("");
      setMessage(t("admin.serviceAdded"));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : t("admin.addService"),
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

  async function updateLabels(
    service: AdminService,
    payload: { label?: string; labelHi?: string },
  ) {
    if (!token || service.id === null) {
      return;
    }

    const updated = await updateAdminService(token, service.id, payload);
    setServices((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle={t("admin.servicesSubtitle")}
        title={t("common.services")}
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
        <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={handleCreate}>
          <label className="flex-1 text-[14px] font-semibold text-[#2f3338]">
            {t("admin.newOtherService")}
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
              onChange={(event) => setLabel(event.target.value)}
              placeholder={t("admin.exampleService")}
              value={label}
            />
          </label>
          <label className="flex-1 text-[14px] font-semibold text-[#2f3338]">
            {t("admin.newOtherServiceHi")}
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
              onChange={(event) => setLabelHi(event.target.value)}
              placeholder={t("admin.exampleServiceHi")}
              value={labelHi}
            />
          </label>
          <AdminButton disabled={isCreating} type="submit">
            {isCreating ? t("common.adding") : t("admin.addService")}
          </AdminButton>
        </form>
      </AdminCard>

      <div className="grid gap-4">
        {isLoading ? (
          <AdminCard>{t("admin.loadingServices")}</AdminCard>
        ) : (
          services.map((service) => (
            <AdminCard key={service.slug}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[18px] font-extrabold text-black">
                      {language === "hi" ? service.labelHi : service.label}
                    </h2>
                    <AdminStatusBadge status={service.isActive ? "active" : "blocked"} />
                  </div>
                  <p className="mt-2 text-[13px] text-[#6d737c]">
                    {language === "hi" ? service.groupHi : service.group} &bull; {service.slug}
                  </p>
                  <p className="mt-1 text-[13px] text-[#6d737c]">
                    {t("common.english")}: {service.label} &bull;{" "}
                    {t("common.hindi")}: {service.labelHi}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <label className="text-[12px] font-semibold text-[#6d737c]">
                      {t("common.english")}
                      <input
                        className="mt-1 h-9 w-full rounded-lg border border-[#e7ecef] px-3 text-[13px] text-[#2f3338] outline-none focus:border-[#f9a21a]"
                        defaultValue={service.label}
                        onBlur={(event) => {
                          const nextLabel = event.target.value.trim();
                          if (nextLabel && nextLabel !== service.label) {
                            void updateLabels(service, { label: nextLabel });
                          }
                        }}
                      />
                    </label>
                    <label className="text-[12px] font-semibold text-[#6d737c]">
                      {t("common.hindi")}
                      <input
                        className="mt-1 h-9 w-full rounded-lg border border-[#e7ecef] px-3 text-[13px] text-[#2f3338] outline-none focus:border-[#f9a21a]"
                        defaultValue={service.labelHi}
                        onBlur={(event) => {
                          const nextLabelHi = event.target.value.trim();
                          if (nextLabelHi && nextLabelHi !== service.labelHi) {
                            void updateLabels(service, { labelHi: nextLabelHi });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-[13px] font-semibold text-[#6d737c]">
                    {t("common.order")}
                    <input
                      className="ml-2 h-9 w-20 rounded-lg border border-[#e7ecef] px-3 text-[13px]"
                      defaultValue={service.displayOrder}
                      min={0}
                      onBlur={(event) =>
                        updateOrder(service, Number(event.target.value))
                      }
                      type="number"
                    />
                  </label>
                  <AdminButton onClick={() => toggleService(service)} tone="secondary">
                    {service.isActive ? t("common.disable") : t("common.enable")}
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
