"use client";

import { useEffect, useState } from "react";
import {
  ProviderCard,
  ProviderPageFrame,
} from "@/components/provider/provider-shell";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import type { TranslationKey } from "@/lib/i18n";
import { ApiError } from "@/lib/http-client";
import { categoryLabelBySlug } from "@/lib/localized-labels";
import { getProviderBookings } from "@/services/auth-service";
import type { ProviderBooking } from "@/types/auth";
import { useRouter } from "next/navigation";

function DetailIcon({ name }: { name: "user" | "location" | "phone" }) {
  const className = "h-5 w-5 shrink-0 sm:h-6 sm:w-6";

  if (name === "location") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.1"
        viewBox="0 0 24 24"
      >
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.1"
        viewBox="0 0 24 24"
      >
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.1"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8" r="3" />
      <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
    </svg>
  );
}

function formatDistance(
  distanceKm: number | null,
  t: (key: TranslationKey, values?: Record<string, string | number>) => string,
) {
  return distanceKm === null
    ? t("customer.distanceUnavailable")
    : t("customer.distanceKm", { distance: distanceKm });
}

export default function ProviderAcceptedBookingsPage() {
  const { language, t } = useI18n();
  const router = useRouter();
  const { isReady, token } = useAuthToken();
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!token) {
      router.replace("/provider/login");
      return;
    }

    let isMounted = true;

    getProviderBookings(token, "accepted")
      .then((nextBookings) => {
        if (isMounted) {
          setBookings(nextBookings);
          setError("");
        }
      })
      .catch((caughtError) => {
        if (isMounted) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : t("provider.acceptedBookings"),
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isReady, router, t, token]);

  return (
    <ProviderPageFrame title={t("provider.acceptedBookings")}>
      <section className="flex flex-col gap-5">
        {isLoading ? (
          <ProviderCard>
            <p className="text-[16px] leading-7 text-[#6d737c]">
              {t("common.loading")}
            </p>
          </ProviderCard>
        ) : null}

        {error ? (
          <ProviderCard>
            <p className="text-[16px] leading-7 text-red-600">{error}</p>
          </ProviderCard>
        ) : null}

        {!isLoading && !error && bookings.length === 0 ? (
          <ProviderCard>
            <div className="text-center">
              <h2 className="text-[20px] font-extrabold tracking-normal text-black sm:text-[22px]">
                {t("provider.noAcceptedBookings")}
              </h2>
              <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-6 tracking-normal text-[#6d737c] sm:text-[16px] sm:leading-7">
                {t("provider.acceptedEmptyDescription")}
              </p>
            </div>
          </ProviderCard>
        ) : null}

        {bookings.map((booking) => (
          <ProviderCard key={booking.id}>
            <h2 className="text-[22px] font-extrabold leading-tight tracking-normal text-black sm:text-[26px]">
              {categoryLabelBySlug(
                booking.categorySlug,
                booking.serviceLabel,
                language,
              )}
            </h2>
            <p className="mt-2 text-[15px] leading-6 tracking-normal text-[#7a7f86] sm:text-[16px]">
              {t("provider.acceptedReady")}
            </p>

            <div className="mt-6 flex flex-col gap-4 text-[16px] leading-6 tracking-normal text-[#2f3338] sm:text-[18px] sm:leading-7">
              <p className="flex items-center gap-4">
                <span className="text-[#7a7f86]">
                  <DetailIcon name="user" />
                </span>
                <span>
                  {t("provider.customerLabel")}:{" "}
                  {booking.customerPhone ?? t("common.unavailable")}
                </span>
              </p>
              <p className="flex items-center gap-4">
                <span className="text-[#7a7f86]">
                  <DetailIcon name="location" />
                </span>
                <span>{formatDistance(booking.distanceKm, t)}</span>
              </p>
            </div>

            <a
              className="mt-6 flex h-[48px] items-center justify-center gap-2 rounded-lg bg-[#f9a21a] px-5 text-[16px] font-semibold tracking-normal text-white transition hover:bg-[#ee9914] sm:h-[50px] sm:gap-3"
              href={`tel:${booking.customerPhone ?? ""}`}
            >
              <DetailIcon name="phone" />
              {t("common.callCustomer")}
            </a>
          </ProviderCard>
        ))}
      </section>
    </ProviderPageFrame>
  );
}
