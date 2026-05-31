"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { ServiceIcon } from "@/components/customer/service-icon";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import {
  createCustomerBooking,
  getCustomerBrands,
  getCustomerBrandServices,
  getCustomerBrandStores,
} from "@/services/auth-service";
import type { CustomerBrandService, CustomerBrandStore } from "@/types/auth";

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function fallbackBrandName(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function serviceLabel(service: CustomerBrandService, language: "en" | "hi") {
  return language === "hi" ? service.labelHi || service.label : service.label;
}

export default function CustomerBrandPage() {
  const { language, t } = useI18n();
  const params = useParams<{ brandSlug: string }>();
  const brandSlug = params.brandSlug;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady, token } = useAuthToken();
  const selectedServiceSlug = searchParams.get("service") ?? "";
  const [brandName, setBrandName] = useState(fallbackBrandName(brandSlug));
  const [services, setServices] = useState<CustomerBrandService[]>([]);
  const [stores, setStores] = useState<CustomerBrandStore[]>([]);
  const [customerCoords, setCustomerCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [error, setError] = useState("");
  const [callError, setCallError] = useState("");
  const [callingStoreId, setCallingStoreId] = useState<number | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.categorySlug === selectedServiceSlug),
    [selectedServiceSlug, services],
  );

  useEffect(() => {
    let isMounted = true;
    const timer = window.setTimeout(() => {
      setIsLoadingServices(true);
      getCustomerBrands()
        .then((brands) => {
          const brand = brands.find((item) => item.slug === brandSlug);
          if (isMounted && brand) {
            setBrandName(brand.name);
          }
        })
        .catch(() => {
          // Fallback title remains available.
        });

      getCustomerBrandServices(brandSlug)
        .then((nextServices) => {
          if (isMounted) {
            setServices(nextServices);
            setError("");
          }
        })
        .catch((caughtError) => {
          if (isMounted) {
            setError(
              caughtError instanceof ApiError
                ? caughtError.message
                : t("customer.noServicesFound"),
            );
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingServices(false);
          }
        });
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [brandSlug, t]);

  useEffect(() => {
    let isMounted = true;
    const timer = window.setTimeout(() => {
      if (!selectedService || !isReady) {
        setStores([]);
        setIsLoadingStores(false);
        return;
      }

      if (!token) {
        router.replace("/customer/login");
        return;
      }

      const selectedCategorySlug = selectedService.categorySlug;
      setIsLoadingStores(true);
      setCallError("");

      function loadStores(coords?: { lat: number; lng: number } | null) {
        getCustomerBrandStores(
          token as string,
          brandSlug,
          selectedCategorySlug,
          coords,
        )
          .then((nextStores) => {
            if (isMounted) {
              setStores(nextStores);
              setError("");
            }
          })
          .catch((caughtError) => {
            if (isMounted) {
              setError(
                caughtError instanceof ApiError
                  ? caughtError.message
                  : t("customer.noStoresFound"),
              );
            }
          })
          .finally(() => {
            if (isMounted) {
              setIsLoadingStores(false);
            }
          });
      }

      if (!navigator.geolocation) {
        loadStores(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCustomerCoords(coords);
          loadStores(coords);
        },
        () => loadStores(null),
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [brandSlug, isReady, router, selectedService, t, token]);

  function selectService(service: CustomerBrandService) {
    setStores([]);
    router.replace(`${pathname}?service=${service.categorySlug}`, { scroll: false });
  }

  async function callStore(store: CustomerBrandStore) {
    if (store.storeType === "provider" && !token) {
      router.replace("/customer/login");
      return;
    }

    setCallError("");
    setCallingStoreId(store.id);

    try {
      if (store.storeType === "provider" && store.providerProfileId !== null && selectedService) {
        await createCustomerBooking(token as string, {
          categorySlug: selectedService.categorySlug,
          latitude: customerCoords?.lat ?? null,
          longitude: customerCoords?.lng ?? null,
          providerProfileId: store.providerProfileId,
        });
      }
      window.location.assign(`tel:${store.phone}`);
    } catch (caughtError) {
      setCallError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to create booking.",
      );
    } finally {
      setCallingStoreId(null);
    }
  }

  return (
    <CustomerShell>
      <div className="mx-auto w-full max-w-[492px] px-6 pb-10 pt-8 sm:max-w-[536px] sm:px-8 md:max-w-[880px] md:px-10">
        <Link
          className="inline-flex items-center gap-2 text-[16px] font-semibold tracking-normal text-[#4d525a]"
          href="/customer/home"
        >
          <span aria-hidden="true">{"<-"}</span>
          {t("common.back")}
        </Link>

        <div className="mt-6">
          <h1 className="text-[25px] font-extrabold leading-tight tracking-normal text-black sm:text-[29px] md:text-[35px]">
            {brandName}
          </h1>
          <p className="mt-2 text-[15px] leading-6 tracking-normal text-[#7a7f86]">
            {t("customer.selectServiceDescription")}
          </p>
        </div>

        <section className="mt-7 rounded-xl border border-[#e7ecef] bg-white px-5 py-6 shadow-[0_2px_10px_rgba(15,23,42,0.07)] sm:px-6 sm:py-7 md:px-7">
          <h2 className="text-[23px] font-extrabold leading-tight tracking-normal text-black sm:text-[26px] md:text-[30px]">
            {t("customer.selectService")}
          </h2>

          {isLoadingServices ? (
            <p className="mt-5 text-[16px] leading-7 tracking-normal text-[#6d737c]">
              {t("common.loading")}
            </p>
          ) : services.length === 0 ? (
            <p className="mt-5 text-[16px] leading-7 tracking-normal text-[#6d737c]">
              {t("customer.noServicesFound")}
            </p>
          ) : (
            <div className="mt-7 divide-y divide-[#edf1f3]">
              {services.map((service) => {
                const isSelected = service.categorySlug === selectedServiceSlug;
                return (
                  <button
                    className={`flex min-h-[82px] w-full items-center gap-4 py-4 text-left transition sm:min-h-[94px] sm:gap-5 ${
                      isSelected ? "text-[#f9a21a]" : "text-black hover:text-[#f9a21a]"
                    }`}
                    key={service.id}
                    onClick={() => selectService(service)}
                    type="button"
                  >
                    <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-[#fff4df] text-[#ee9f19] sm:h-[62px] sm:w-[62px]">
                      <ServiceIcon
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        slug={service.categorySlug}
                      />
                    </span>
                    <span className="min-w-0 flex-1 text-[17px] font-bold leading-6 tracking-normal sm:text-[19px]">
                      {serviceLabel(service, language)}
                    </span>
                    <span className="shrink-0 text-[#6d737c]">
                      <ArrowRightIcon />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {selectedService ? (
          <section className="mt-7">
            <h2 className="text-[23px] font-extrabold leading-tight tracking-normal text-black sm:text-[26px] md:text-[30px]">
              {t("customer.availableStores")}
            </h2>

            {callError ? (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-[14px] leading-5 text-red-600">
                {callError}
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-xl border border-[#e7ecef] bg-white px-6 py-7 text-[17px] leading-7 text-red-600 shadow-[0_2px_10px_rgba(15,23,42,0.07)]">
                {error}
              </div>
            ) : isLoadingStores ? (
              <div className="mt-5 rounded-xl border border-[#e7ecef] bg-white px-6 py-7 text-[17px] leading-7 text-[#6d737c] shadow-[0_2px_10px_rgba(15,23,42,0.07)]">
                {t("common.loading")}
              </div>
            ) : stores.length === 0 ? (
              <div className="mt-5 rounded-xl border border-[#e7ecef] bg-white px-6 py-8 text-center shadow-[0_2px_10px_rgba(15,23,42,0.07)]">
                <h3 className="text-[24px] font-extrabold tracking-normal text-black">
                  {t("customer.noStoresFound")}
                </h3>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-5">
                {stores.map((store) => (
                  <article
                    className="rounded-xl border border-[#e7ecef] bg-white px-5 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.07)]"
                    key={store.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[21px] font-extrabold leading-7 tracking-normal text-black">
                          {store.shopName}
                        </h3>
                        <p className="mt-1 text-[15px] leading-6 tracking-normal text-[#6d737c]">
                          {store.contactName}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#defde7] px-3 py-1 text-[13px] font-semibold tracking-normal text-[#2aa946]">
                        {store.distanceKm !== null
                          ? `${store.distanceKm} km`
                          : t("customer.distanceUnavailable")}
                      </span>
                    </div>
                    <button
                      className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-[#f9a21a] text-[16px] font-semibold tracking-normal text-white transition hover:bg-[#ee9914] disabled:cursor-not-allowed disabled:bg-[#f7c982]"
                      disabled={callingStoreId === store.id}
                      onClick={() => callStore(store)}
                      type="button"
                    >
                      {callingStoreId === store.id
                        ? t("common.loading")
                        : t("common.callProvider")}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </CustomerShell>
  );
}
