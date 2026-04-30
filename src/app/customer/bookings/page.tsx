"use client";

import { useEffect, useState } from "react";
import { CustomerShell } from "@/components/customer/customer-shell";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { getCustomerBookings } from "@/services/auth-service";
import type { CustomerBooking } from "@/types/auth";
import { useRouter } from "next/navigation";

export default function CustomerBookingsPage() {
  const router = useRouter();
  const { isReady, token } = useAuthToken();
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!token) {
      router.replace("/customer/login");
      return;
    }

    let isMounted = true;

    getCustomerBookings(token)
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
              : "Unable to load bookings.",
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
  }, [isReady, router, token]);

  return (
    <CustomerShell>
      <div className="mx-auto w-full max-w-[492px] px-6 pb-10 pt-8 sm:max-w-[536px] sm:px-8 md:max-w-[880px] md:px-10">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-normal text-black sm:text-[30px] md:text-[35px]">
          My Booking
        </h1>

        <section className="mt-7 rounded-xl border border-[#e7ecef] bg-white px-5 py-7 shadow-[0_2px_10px_rgba(15,23,42,0.07)] sm:px-6 sm:py-8">
          {isLoading ? (
            <p className="text-[17px] leading-7 text-[#6d737c]">
              Loading bookings...
            </p>
          ) : null}

          {error ? (
            <p className="text-[17px] leading-7 text-red-600">{error}</p>
          ) : null}

          {!isLoading && !error && bookings.length === 0 ? (
            <div className="text-center">
              <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#fff4df] text-[#ee9f19] sm:h-20 sm:w-20">
                <svg
                  aria-hidden="true"
                  className="h-9 w-9 sm:h-10 sm:w-10"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.1"
                  viewBox="0 0 24 24"
                >
                  <rect height="18" rx="2" width="12" x="6" y="3" />
                  <path d="M9 8h6" />
                  <path d="M9 12h6" />
                  <path d="M9 16h3" />
                </svg>
              </div>
              <h2 className="mt-5 text-[22px] font-extrabold tracking-normal text-black">
                No bookings yet
              </h2>
              <p className="mt-3 text-[16px] leading-6 tracking-normal text-[#6d737c]">
                Your service bookings will appear here after you book a shop.
              </p>
            </div>
          ) : null}

          {!isLoading && !error && bookings.length > 0 ? (
            <div className="flex flex-col gap-4">
              {bookings.map((booking) => (
                <article
                  className="rounded-xl border border-[#e7ecef] px-4 py-4 text-left"
                  key={booking.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[18px] font-extrabold leading-6 tracking-normal text-black">
                        {booking.serviceLabel}
                      </h2>
                      <p className="mt-1 text-[14px] leading-5 text-[#6d737c]">
                        {booking.shopCompanyName}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#fff4df] px-3 py-1 text-[12px] font-semibold capitalize tracking-normal text-[#d88708]">
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] leading-5 text-[#6d737c]">
                    Provider: {booking.providerPhone}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </CustomerShell>
  );
}
