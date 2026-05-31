"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { categoryLabel } from "@/lib/localized-labels";
import {
  createAdminBrand,
  createAdminBrandService,
  createAdminManualBrandStore,
  createAdminProviderBrandStore,
  getAdminBrandServices,
  getAdminBrandStores,
  getAdminBrands,
  getAdminProviders,
  getAdminServices,
  updateAdminBrand,
  updateAdminBrandService,
  updateAdminBrandStore,
} from "@/services/admin-service";
import type {
  AdminBrand,
  AdminBrandService,
  AdminBrandStore,
  AdminProvider,
  AdminService,
} from "@/types/admin";

type ManualStoreForm = {
  shopName: string;
  contactName: string;
  phone: string;
  email: string;
  latitude: string;
  longitude: string;
};

const emptyManualStoreForm: ManualStoreForm = {
  contactName: "",
  email: "",
  latitude: "",
  longitude: "",
  phone: "",
  shopName: "",
};

function brandServiceLabel(service: AdminBrandService, language: "en" | "hi") {
  return language === "hi" ? service.labelHi || service.label : service.label;
}

function sortByOrder<T extends { displayOrder: number; id: number }>(items: T[]) {
  return [...items].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.id - b.id,
  );
}

export default function AdminBrandsPage() {
  const { language, t } = useI18n();
  const { token } = useAuthToken();
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [brandServices, setBrandServices] = useState<AdminBrandService[]>([]);
  const [stores, setStores] = useState<AdminBrandStore[]>([]);
  const [categories, setCategories] = useState<AdminService[]>([]);
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedBrandServiceId, setSelectedBrandServiceId] = useState<number | null>(
    null,
  );
  const [brandName, setBrandName] = useState("");
  const [serviceSlug, setServiceSlug] = useState("");
  const [providerId, setProviderId] = useState("");
  const [manualStore, setManualStore] =
    useState<ManualStoreForm>(emptyManualStoreForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBrand = brands.find((brand) => brand.id === selectedBrandId) ?? null;
  const selectedBrandService =
    brandServices.find((service) => service.id === selectedBrandServiceId) ?? null;
  const availableCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.isActive &&
          !brandServices.some((service) => service.categorySlug === category.slug),
      ),
    [brandServices, categories],
  );
  const availableProviders = useMemo(
    () =>
      providers.filter(
        (provider) =>
          !stores.some((store) => store.providerProfileId === provider.id),
      ),
    [providers, stores],
  );

  function showError(caughtError: unknown, fallback: string) {
    setError(caughtError instanceof ApiError ? caughtError.message : fallback);
  }

  function loadBrands() {
    if (!token) {
      return;
    }

    setIsLoadingBrands(true);
    Promise.all([
      getAdminBrands(token),
      getAdminServices(token),
      getAdminProviders(token, { status: "approved" }),
    ])
      .then(([nextBrands, nextCategories, nextProviders]) => {
        const orderedBrands = sortByOrder(nextBrands);
        setBrands(orderedBrands);
        setCategories(nextCategories);
        setProviders(nextProviders);
        setSelectedBrandId((current) => current ?? orderedBrands[0]?.id ?? null);
        setError("");
      })
      .catch((caughtError) => showError(caughtError, t("admin.loadingBrands")))
      .finally(() => setIsLoadingBrands(false));
  }

  function loadBrandServices(brandId: number) {
    if (!token) {
      return;
    }

    setIsLoadingServices(true);
    getAdminBrandServices(token, brandId)
      .then((nextServices) => {
        const orderedServices = sortByOrder(nextServices);
        setBrandServices(orderedServices);
        setSelectedBrandServiceId(orderedServices[0]?.id ?? null);
        setServiceSlug("");
        setError("");
      })
      .catch((caughtError) => showError(caughtError, t("admin.loadingServices")))
      .finally(() => setIsLoadingServices(false));
  }

  function loadStores(brandServiceId: number) {
    if (!token) {
      return;
    }

    setIsLoadingStores(true);
    getAdminBrandStores(token, brandServiceId)
      .then((nextStores) => {
        setStores(sortByOrder(nextStores));
        setError("");
      })
      .catch((caughtError) => showError(caughtError, t("admin.noBrandStores")))
      .finally(() => setIsLoadingStores(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(loadBrands, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    if (selectedBrandId === null) {
      const timer = window.setTimeout(() => {
        if (isMounted) {
          setBrandServices([]);
          setSelectedBrandServiceId(null);
        }
      }, 0);
      return () => {
        isMounted = false;
        window.clearTimeout(timer);
      };
    }
    const timer = window.setTimeout(() => loadBrandServices(selectedBrandId), 0);
    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandId, token]);

  useEffect(() => {
    let isMounted = true;
    if (selectedBrandServiceId === null) {
      const timer = window.setTimeout(() => {
        if (isMounted) {
          setStores([]);
        }
      }, 0);
      return () => {
        isMounted = false;
        window.clearTimeout(timer);
      };
    }
    const timer = window.setTimeout(() => loadStores(selectedBrandServiceId), 0);
    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandServiceId, token]);

  async function handleCreateBrand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !brandName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAdminBrand(token, { name: brandName.trim() });
      setBrands((current) => sortByOrder([...current, created]));
      setSelectedBrandId(created.id);
      setBrandName("");
      setMessage(t("admin.brandAdded"));
      setError("");
    } catch (caughtError) {
      showError(caughtError, t("admin.addBrand"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function patchBrand(brand: AdminBrand, payload: Partial<AdminBrand>) {
    if (!token) {
      return;
    }
    const updated = await updateAdminBrand(token, brand.id, payload);
    setBrands((current) =>
      sortByOrder(current.map((item) => (item.id === updated.id ? updated : item))),
    );
  }

  async function handleCreateBrandService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || selectedBrandId === null || !serviceSlug) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAdminBrandService(token, selectedBrandId, {
        categorySlug: serviceSlug,
      });
      setBrandServices((current) => sortByOrder([...current, created]));
      setSelectedBrandServiceId(created.id);
      setServiceSlug("");
      setMessage(t("admin.addBrandService"));
      setError("");
    } catch (caughtError) {
      showError(caughtError, t("admin.addBrandService"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function patchBrandService(
    service: AdminBrandService,
    payload: Partial<AdminBrandService>,
  ) {
    if (!token) {
      return;
    }
    const updated = await updateAdminBrandService(token, service.id, payload);
    setBrandServices((current) =>
      sortByOrder(current.map((item) => (item.id === updated.id ? updated : item))),
    );
  }

  async function handleCreateProviderStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || selectedBrandServiceId === null || !providerId) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAdminProviderBrandStore(
        token,
        selectedBrandServiceId,
        { providerProfileId: Number(providerId) },
      );
      setStores((current) => sortByOrder([...current, created]));
      setProviderId("");
      setMessage(t("admin.storeAdded"));
      setError("");
    } catch (caughtError) {
      showError(caughtError, t("admin.addExistingStore"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateManualStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !token ||
      selectedBrandServiceId === null ||
      !manualStore.shopName.trim() ||
      !manualStore.contactName.trim() ||
      !manualStore.phone.trim()
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAdminManualBrandStore(
        token,
        selectedBrandServiceId,
        {
          contactName: manualStore.contactName.trim(),
          email: manualStore.email.trim() || null,
          latitude: manualStore.latitude.trim()
            ? Number(manualStore.latitude)
            : null,
          longitude: manualStore.longitude.trim()
            ? Number(manualStore.longitude)
            : null,
          phone: manualStore.phone.trim(),
          shopName: manualStore.shopName.trim(),
        },
      );
      setStores((current) => sortByOrder([...current, created]));
      setManualStore(emptyManualStoreForm);
      setMessage(t("admin.storeAdded"));
      setError("");
    } catch (caughtError) {
      showError(caughtError, t("admin.addManualStore"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function patchStore(store: AdminBrandStore, payload: Partial<AdminBrandStore>) {
    if (!token) {
      return;
    }
    const updated = await updateAdminBrandStore(token, store.id, payload);
    setStores((current) =>
      sortByOrder(current.map((item) => (item.id === updated.id ? updated : item))),
    );
  }

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle={t("admin.brandServicesSubtitle")}
        title={t("nav.brandServices")}
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
        <form className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end" onSubmit={handleCreateBrand}>
          <label className="text-[14px] font-semibold text-[#2f3338]">
            {t("admin.brandName")}
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
              onChange={(event) => setBrandName(event.target.value)}
              placeholder="Samsung Service"
              value={brandName}
            />
          </label>
          <AdminButton disabled={isSubmitting} type="submit">
            {isSubmitting ? t("common.adding") : t("admin.addBrand")}
          </AdminButton>
        </form>
      </AdminCard>

      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <section className="grid h-fit gap-3">
          {isLoadingBrands ? (
            <AdminCard>{t("admin.loadingBrands")}</AdminCard>
          ) : brands.length === 0 ? (
            <AdminCard>{t("admin.noBrandsFound")}</AdminCard>
          ) : (
            brands.map((brand) => (
              <AdminCard
                className={
                  selectedBrandId === brand.id ? "border-[#f9a21a]" : ""
                }
                key={brand.id}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="text-left text-[18px] font-extrabold text-black"
                      onClick={() => setSelectedBrandId(brand.id)}
                      type="button"
                    >
                      {brand.name}
                    </button>
                    <AdminStatusBadge status={brand.isActive ? "active" : "blocked"} />
                  </div>
                  <p className="text-[13px] text-[#6d737c]">{brand.slug}</p>
                  <input
                    className="h-9 rounded-lg border border-[#e7ecef] px-3 text-[13px] text-[#2f3338] outline-none focus:border-[#f9a21a]"
                    defaultValue={brand.name}
                    onBlur={(event) => {
                      const nextName = event.target.value.trim();
                      if (nextName && nextName !== brand.name) {
                        void patchBrand(brand, { name: nextName });
                      }
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-[13px] font-semibold text-[#6d737c]">
                      {t("common.order")}
                      <input
                        className="ml-2 h-9 w-20 rounded-lg border border-[#e7ecef] px-3 text-[13px]"
                        defaultValue={brand.displayOrder}
                        min={0}
                        onBlur={(event) =>
                          void patchBrand(brand, {
                            displayOrder: Number(event.target.value),
                          })
                        }
                        type="number"
                      />
                    </label>
                    <AdminButton onClick={() => setSelectedBrandId(brand.id)} tone="secondary">
                      {t("common.view")}
                    </AdminButton>
                    <AdminButton
                      onClick={() =>
                        void patchBrand(brand, { isActive: !brand.isActive })
                      }
                      tone="secondary"
                    >
                      {brand.isActive ? t("common.disable") : t("common.enable")}
                    </AdminButton>
                  </div>
                </div>
              </AdminCard>
            ))
          )}
        </section>

        <section className="grid gap-5">
          <AdminCard>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-[22px] font-extrabold text-black">
                  {selectedBrand?.name ?? t("nav.brandServices")}
                </h2>
                <p className="mt-1 text-[14px] text-[#6d737c]">
                  {t("admin.addBrandService")}
                </p>
              </div>
            </div>

            <form
              className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end"
              onSubmit={handleCreateBrandService}
            >
              <label className="text-[14px] font-semibold text-[#2f3338]">
                {t("common.services")}
                <select
                  className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a]"
                  onChange={(event) => setServiceSlug(event.target.value)}
                  value={serviceSlug}
                >
                  <option value="">{t("admin.selectServiceToAdd")}</option>
                  {availableCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {categoryLabel(category, language)}
                    </option>
                  ))}
                </select>
              </label>
              <AdminButton
                disabled={isSubmitting || selectedBrandId === null || !serviceSlug}
                type="submit"
              >
                {t("admin.addBrandService")}
              </AdminButton>
            </form>

            <div className="mt-5 grid gap-3">
              {isLoadingServices ? (
                <p className="text-[14px] text-[#6d737c]">{t("admin.loadingServices")}</p>
              ) : brandServices.length === 0 ? (
                <p className="text-[14px] text-[#6d737c]">{t("admin.noBrandServices")}</p>
              ) : (
                brandServices.map((service) => (
                  <div
                    className={`rounded-lg border px-4 py-3 ${
                      selectedBrandServiceId === service.id
                        ? "border-[#f9a21a] bg-[#fffaf0]"
                        : "border-[#e7ecef]"
                    }`}
                    key={service.id}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            className="text-left text-[17px] font-bold text-black"
                            onClick={() => setSelectedBrandServiceId(service.id)}
                            type="button"
                          >
                            {brandServiceLabel(service, language)}
                          </button>
                          <AdminStatusBadge
                            status={service.isActive ? "active" : "blocked"}
                          />
                        </div>
                        <p className="mt-1 text-[13px] text-[#6d737c]">
                          {service.categorySlug}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="text-[13px] font-semibold text-[#6d737c]">
                          {t("common.order")}
                          <input
                            className="ml-2 h-9 w-20 rounded-lg border border-[#e7ecef] px-3 text-[13px]"
                            defaultValue={service.displayOrder}
                            min={0}
                            onBlur={(event) =>
                              void patchBrandService(service, {
                                displayOrder: Number(event.target.value),
                              })
                            }
                            type="number"
                          />
                        </label>
                        <AdminButton
                          onClick={() => setSelectedBrandServiceId(service.id)}
                          tone="secondary"
                        >
                          {t("common.view")}
                        </AdminButton>
                        <AdminButton
                          onClick={() =>
                            void patchBrandService(service, {
                              isActive: !service.isActive,
                            })
                          }
                          tone="secondary"
                        >
                          {service.isActive ? t("common.disable") : t("common.enable")}
                        </AdminButton>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="text-[22px] font-extrabold text-black">
              {t("customer.availableStores")}
            </h2>
            <p className="mt-1 text-[14px] text-[#6d737c]">
              {selectedBrandService
                ? brandServiceLabel(selectedBrandService, language)
                : t("admin.noBrandServices")}
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <form className="rounded-lg border border-[#e7ecef] p-4" onSubmit={handleCreateProviderStore}>
                <h3 className="text-[16px] font-bold text-black">
                  {t("admin.addExistingStore")}
                </h3>
                <label className="mt-3 block text-[13px] font-semibold text-[#2f3338]">
                  {t("admin.selectApprovedProvider")}
                  <select
                    className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-3 text-[14px] outline-none focus:border-[#f9a21a]"
                    onChange={(event) => setProviderId(event.target.value)}
                    value={providerId}
                  >
                    <option value="">{t("admin.selectApprovedProvider")}</option>
                    {availableProviders.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.shopCompanyName} - {provider.whatsappMobileNumber}
                      </option>
                    ))}
                  </select>
                </label>
                <AdminButton
                  className="mt-3"
                  disabled={isSubmitting || selectedBrandServiceId === null || !providerId}
                  type="submit"
                >
                  {t("admin.addExistingStore")}
                </AdminButton>
              </form>

              <form className="rounded-lg border border-[#e7ecef] p-4" onSubmit={handleCreateManualStore}>
                <h3 className="text-[16px] font-bold text-black">
                  {t("admin.addManualStore")}
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    className="h-10 rounded-lg border border-[#e7ecef] px-3 text-[13px] outline-none focus:border-[#f9a21a]"
                    onChange={(event) =>
                      setManualStore((current) => ({
                        ...current,
                        shopName: event.target.value,
                      }))
                    }
                    placeholder={t("provider.shopName")}
                    value={manualStore.shopName}
                  />
                  <input
                    className="h-10 rounded-lg border border-[#e7ecef] px-3 text-[13px] outline-none focus:border-[#f9a21a]"
                    onChange={(event) =>
                      setManualStore((current) => ({
                        ...current,
                        contactName: event.target.value,
                      }))
                    }
                    placeholder={t("provider.ownerName")}
                    value={manualStore.contactName}
                  />
                  <input
                    className="h-10 rounded-lg border border-[#e7ecef] px-3 text-[13px] outline-none focus:border-[#f9a21a]"
                    onChange={(event) =>
                      setManualStore((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder={t("common.phone")}
                    value={manualStore.phone}
                  />
                  <input
                    className="h-10 rounded-lg border border-[#e7ecef] px-3 text-[13px] outline-none focus:border-[#f9a21a]"
                    onChange={(event) =>
                      setManualStore((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder={t("common.email")}
                    value={manualStore.email}
                  />
                  <input
                    className="h-10 rounded-lg border border-[#e7ecef] px-3 text-[13px] outline-none focus:border-[#f9a21a]"
                    onChange={(event) =>
                      setManualStore((current) => ({
                        ...current,
                        latitude: event.target.value,
                      }))
                    }
                    placeholder="Latitude"
                    value={manualStore.latitude}
                  />
                  <input
                    className="h-10 rounded-lg border border-[#e7ecef] px-3 text-[13px] outline-none focus:border-[#f9a21a]"
                    onChange={(event) =>
                      setManualStore((current) => ({
                        ...current,
                        longitude: event.target.value,
                      }))
                    }
                    placeholder="Longitude"
                    value={manualStore.longitude}
                  />
                </div>
                <AdminButton
                  className="mt-3"
                  disabled={isSubmitting || selectedBrandServiceId === null}
                  type="submit"
                >
                  {t("admin.addManualStore")}
                </AdminButton>
              </form>
            </div>

            <div className="mt-5 grid gap-3">
              {isLoadingStores ? (
                <p className="text-[14px] text-[#6d737c]">{t("common.loading")}</p>
              ) : stores.length === 0 ? (
                <p className="text-[14px] text-[#6d737c]">{t("admin.noBrandStores")}</p>
              ) : (
                stores.map((store) => (
                  <div
                    className="rounded-lg border border-[#e7ecef] px-4 py-3"
                    key={store.id}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[17px] font-bold text-black">
                            {store.shopName}
                          </h3>
                          <AdminStatusBadge
                            status={store.isActive ? "active" : "blocked"}
                          />
                          <span className="rounded-full bg-[#fff4df] px-3 py-1 text-[12px] font-semibold capitalize text-[#d88708]">
                            {store.storeType === "manual"
                              ? t("admin.manualStore")
                              : t("common.provider")}
                          </span>
                        </div>
                        <p className="mt-1 text-[13px] text-[#6d737c]">
                          {store.contactName} &bull; {store.phone}
                        </p>
                        {store.storeType === "manual" ? (
                          <div className="mt-3 grid gap-2 sm:grid-cols-3">
                            <input
                              className="h-9 rounded-lg border border-[#e7ecef] px-3 text-[13px]"
                              defaultValue={store.shopName}
                              onBlur={(event) => {
                                const shopName = event.target.value.trim();
                                if (shopName && shopName !== store.shopName) {
                                  void patchStore(store, { shopName });
                                }
                              }}
                            />
                            <input
                              className="h-9 rounded-lg border border-[#e7ecef] px-3 text-[13px]"
                              defaultValue={store.contactName}
                              onBlur={(event) => {
                                const contactName = event.target.value.trim();
                                if (contactName && contactName !== store.contactName) {
                                  void patchStore(store, { contactName });
                                }
                              }}
                            />
                            <input
                              className="h-9 rounded-lg border border-[#e7ecef] px-3 text-[13px]"
                              defaultValue={store.phone}
                              onBlur={(event) => {
                                const phone = event.target.value.trim();
                                if (phone && phone !== store.phone) {
                                  void patchStore(store, { phone });
                                }
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="text-[13px] font-semibold text-[#6d737c]">
                          {t("common.order")}
                          <input
                            className="ml-2 h-9 w-20 rounded-lg border border-[#e7ecef] px-3 text-[13px]"
                            defaultValue={store.displayOrder}
                            min={0}
                            onBlur={(event) =>
                              void patchStore(store, {
                                displayOrder: Number(event.target.value),
                              })
                            }
                            type="number"
                          />
                        </label>
                        <AdminButton
                          onClick={() =>
                            void patchStore(store, { isActive: !store.isActive })
                          }
                          tone="secondary"
                        >
                          {store.isActive ? t("common.disable") : t("common.enable")}
                        </AdminButton>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminCard>
        </section>
      </div>
    </AdminShell>
  );
}
