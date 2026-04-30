"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { ServiceIcon } from "@/components/customer/service-icon";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { serviceCategoryBySlug } from "@/lib/service-categories";
import {
  createCustomerBooking,
  getCategories,
  getCustomerProviders,
} from "@/services/auth-service";
import type { CustomerProviderResult } from "@/types/auth";

export default function CustomerServiceResultsPage() {
  const params = useParams<{ categorySlug: string }>();
  const router = useRouter();
  const { isReady, token } = useAuthToken();
  const categorySlug = params.categorySlug;
  const category = serviceCategoryBySlug[categorySlug];
  const fallbackCategoryLabel =
    category?.label ??
    categorySlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  const [categoryLabel, setCategoryLabel] = useState(fallbackCategoryLabel);
  const [providers, setProviders] = useState<CustomerProviderResult[]>([]);
  const [error, setError] = useState("");
  const [callError, setCallError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [callingProviderId, setCallingProviderId] = useState<number | null>(null);
  const [customerCoords, setCustomerCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationMessage, setLocationMessage] = useState("Showing matching shops.");

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!token) {
      router.replace("/customer/login");
      return;
    }

    let isMounted = true;

    getCategories()
      .then((categories) => {
        const matchedCategory = categories.find(
          (nextCategory) => nextCategory.slug === categorySlug,
        );
        if (isMounted && matchedCategory) {
          setCategoryLabel(matchedCategory.label);
        }
      })
      .catch(() => {
        // Static label fallback remains available.
      });

    function loadProviders(coords?: { lat: number; lng: number } | null) {
      getCustomerProviders(token as string, categorySlug, coords)
        .then((nextProviders) => {
          if (isMounted) {
            setProviders(nextProviders);
            setError("");
          }
        })
        .catch((caughtError) => {
          if (isMounted) {
            setError(
              caughtError instanceof ApiError
                ? caughtError.message
                : "Unable to load shops.",
            );
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }

    if (!navigator.geolocation) {
      loadProviders(null);
      return () => {
        isMounted = false;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocationMessage("Sorted by nearby distance.");
        setCustomerCoords(coords);
        loadProviders(coords);
      },
      () => {
        setLocationMessage("Location denied. Showing matching shops.");
        loadProviders(null);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );

    return () => {
      isMounted = false;
    };
  }, [categorySlug, isReady, router, token]);

  async function handleCallProvider(provider: CustomerProviderResult) {
    if (!token) {
      router.replace("/customer/login");
      return;
    }

    setCallError("");
    setCallingProviderId(provider.providerId);

    try {
      await createCustomerBooking(token, {
        categorySlug,
        latitude: customerCoords?.lat ?? null,
        longitude: customerCoords?.lng ?? null,
        providerProfileId: provider.providerId,
      });
      window.location.assign(`tel:${provider.whatsappMobileNumber}`);
    } catch (caughtError) {
      setCallError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to create booking.",
      );
    } finally {
      setCallingProviderId(null);
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
          Back
        </Link>

        <>
          <div className="mt-6 flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#fff4df] text-[#ee9f19] sm:h-16 sm:w-16">
                <ServiceIcon className="h-8 w-8 sm:h-9 sm:w-9" slug={categorySlug} />
              </span>
              <div>
                <h1 className="text-[25px] font-extrabold leading-tight tracking-normal text-black sm:text-[29px] md:text-[35px]">
                  {categoryLabel}
                </h1>
                <p className="mt-1 text-[15px] leading-6 tracking-normal text-[#7a7f86]">
                  {locationMessage}
                </p>
              </div>
          </div>

          <section className="mt-7">
          {callError ? (
            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-[14px] leading-5 text-red-600">
              {callError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-xl border border-[#e7ecef] bg-white px-6 py-7 text-[17px] leading-7 text-[#6d737c] shadow-[0_2px_10px_rgba(15,23,42,0.07)]">
              Loading nearby shops...
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-[#e7ecef] bg-white px-6 py-7 text-[17px] leading-7 text-red-600 shadow-[0_2px_10px_rgba(15,23,42,0.07)]">
              {error}
            </div>
          ) : null}

          {!isLoading && !error && providers.length === 0 ? (
            <div className="rounded-xl border border-[#e7ecef] bg-white px-6 py-8 text-center shadow-[0_2px_10px_rgba(15,23,42,0.07)]">
              <h2 className="text-[24px] font-extrabold tracking-normal text-black">
                No shops found
              </h2>
              <p className="mt-3 text-[16px] leading-6 tracking-normal text-[#6d737c]">
                Approved providers for this category will appear here.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-5">
            {providers.map((provider) => (
              <article
                className="rounded-xl border border-[#e7ecef] bg-white px-5 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.07)]"
                key={provider.providerId}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[21px] font-extrabold leading-7 tracking-normal text-black">
                      {provider.shopCompanyName}
                    </h2>
                    <p className="mt-1 text-[15px] leading-6 tracking-normal text-[#6d737c]">
                      {provider.ownerName}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#defde7] px-3 py-1 text-[13px] font-semibold tracking-normal text-[#2aa946]">
                    {provider.distanceKm !== null
                      ? `${provider.distanceKm} km`
                      : "Nearby"}
                  </span>
                </div>
                <button
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-[#f9a21a] text-[16px] font-semibold tracking-normal text-white transition hover:bg-[#ee9914] disabled:cursor-not-allowed disabled:bg-[#f7c982]"
                  disabled={callingProviderId === provider.providerId}
                  onClick={() => handleCallProvider(provider)}
                  type="button"
                >
                  {callingProviderId === provider.providerId
                    ? "Creating Booking..."
                    : "Call Provider"}
                </button>
              </article>
            ))}
          </div>
          </section>
        </>
      </div>
    </CustomerShell>
  );
}
