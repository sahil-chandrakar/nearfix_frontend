"use client";

import { useEffect, useState } from "react";
import {
  ProviderCard,
  ProviderPageFrame,
} from "@/components/provider/provider-shell";
import { env } from "@/config/env";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import {
  getProviderBookings,
  getProviderCategories,
  updateProviderBookingStatus,
} from "@/services/auth-service";
import type { BookingStatus, ProviderBooking } from "@/types/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

type DashboardStatus = Extract<BookingStatus, "pending" | "declined">;

function DetailIcon({ name }: { name: "phone" | "location" | "x" | "check" }) {
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

  if (name === "x") {
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
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    );
  }

  if (name === "check") {
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
        <path d="m20 6-11 11-5-5" />
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
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

function formatDistance(distanceKm: number | null) {
  return distanceKm === null
    ? "Distance unavailable"
    : `${distanceKm} km away`;
}

function playBookingSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.38);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch {
    // Browsers can block audio until the page has a user gesture.
  }
}

function BookingCard({
  booking,
  busyBookingId,
  onAccept,
  onDecline,
  status,
}: {
  booking: ProviderBooking;
  busyBookingId: number | null;
  onAccept: (booking: ProviderBooking) => void;
  onDecline: (booking: ProviderBooking) => void;
  status: DashboardStatus;
}) {
  const isBusy = busyBookingId === booking.id;

  return (
    <ProviderCard>
      <h2 className="text-[22px] font-extrabold leading-tight tracking-normal text-black sm:text-[26px]">
        {booking.serviceLabel}
      </h2>
      <p className="mt-2 text-[15px] leading-6 tracking-normal text-[#7a7f86] sm:text-[16px]">
        {status === "pending" ? "New service request" : "Declined booking"}
      </p>

      <div className="mt-6 flex flex-col gap-4 text-[16px] leading-6 tracking-normal text-[#2f3338] sm:text-[18px] sm:leading-7">
        <p className="flex items-center gap-4">
          <span className="text-[#7a7f86]">
            <DetailIcon name="phone" />
          </span>
          <span>Customer: {booking.customerPhone ?? "Unavailable"}</span>
        </p>
        <p className="flex items-center gap-4">
          <span className="text-[#7a7f86]">
            <DetailIcon name="location" />
          </span>
          <span>{formatDistance(booking.distanceKm)}</span>
        </p>
      </div>

      {status === "pending" ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          <button
            className="flex h-[46px] items-center justify-center gap-2 rounded-lg border border-[#e7ecef] bg-white px-4 text-[15px] font-semibold tracking-normal text-[#2f3338] transition hover:bg-[#f7f8f9] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[50px] sm:gap-3 sm:text-[16px]"
            disabled={isBusy}
            onClick={() => onDecline(booking)}
            type="button"
          >
            <DetailIcon name="x" />
            Decline
          </button>
          <button
            className="flex h-[46px] items-center justify-center gap-2 rounded-lg bg-[#f9a21a] px-4 text-[15px] font-semibold tracking-normal text-white transition hover:bg-[#ee9914] disabled:cursor-not-allowed disabled:bg-[#f7c982] sm:h-[50px] sm:gap-3 sm:text-[16px]"
            disabled={isBusy}
            onClick={() => onAccept(booking)}
            type="button"
          >
            <DetailIcon name="check" />
            Accept
          </button>
        </div>
      ) : null}
    </ProviderCard>
  );
}

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { isReady, token } = useAuthToken();
  const [activeStatus, setActiveStatus] = useState<DashboardStatus>("pending");
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [toastBooking, setToastBooking] = useState<ProviderBooking | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyBookingId, setBusyBookingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    let isMounted = true;
    getProviderCategories(token)
      .then((categories) => {
        if (isMounted) {
          setCategoryCount(categories.categorySlugs.length);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCategoryCount(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isReady, token]);

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    let isMounted = true;

    getProviderBookings(token, activeStatus)
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
  }, [activeStatus, isReady, token]);

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    const socket = new WebSocket(
      `${env.wsBaseUrl}/provider/bookings/ws?token=${encodeURIComponent(token)}`,
    );

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as {
          booking?: ProviderBooking;
          type?: string;
        };
        const incomingBooking = payload.booking;
        if (payload.type !== "booking_created" || !incomingBooking) {
          return;
        }

        playBookingSound();
        setToastBooking(incomingBooking);
        setBookings((currentBookings) => {
          if (activeStatus !== "pending") {
            return currentBookings;
          }

          if (currentBookings.some((booking) => booking.id === incomingBooking.id)) {
            return currentBookings;
          }

          return [incomingBooking, ...currentBookings];
        });
      } catch {
        // Ignore malformed WebSocket payloads.
      }
    };

    return () => socket.close();
  }, [activeStatus, isReady, token]);

  async function updateStatus(
    booking: ProviderBooking,
    nextStatus: Exclude<BookingStatus, "pending">,
  ) {
    if (!token) {
      router.replace("/provider/login");
      return;
    }

    setError("");
    setBusyBookingId(booking.id);
    try {
      await updateProviderBookingStatus(token, booking.id, nextStatus);
      setBookings((currentBookings) =>
        currentBookings.filter((currentBooking) => currentBooking.id !== booking.id),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update booking.",
      );
    } finally {
      setBusyBookingId(null);
    }
  }

  return (
    <ProviderPageFrame title="New Bookings">
      {toastBooking ? (
        <div className="fixed left-4 right-4 top-24 z-40 mx-auto max-w-[460px] rounded-xl border border-[#f3d99b] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold text-[#f9a21a]">
                New booking received
              </p>
              <p className="mt-1 text-[15px] leading-5 text-[#4d525a]">
                {toastBooking.serviceLabel} from{" "}
                {toastBooking.customerPhone ?? "customer"}
              </p>
            </div>
            <button
              aria-label="Close booking alert"
              className="text-[24px] leading-none text-[#6d737c]"
              onClick={() => setToastBooking(null)}
              type="button"
            >
              &times;
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-1 shadow-[0_2px_10px_rgba(15,23,42,0.07)]">
        {(["pending", "declined"] as const).map((statusOption) => (
          <button
            className={`h-10 rounded-lg text-[14px] font-semibold tracking-normal transition sm:h-11 sm:text-[15px] ${
              activeStatus === statusOption
                ? "bg-[#f9a21a] text-white"
                : "text-[#4d525a] hover:bg-[#fff4df]"
            }`}
            key={statusOption}
            onClick={() => setActiveStatus(statusOption)}
            type="button"
          >
            {statusOption === "pending" ? "Pending" : "Declined"}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-[14px] leading-5 text-red-600">
          {error}
        </p>
      ) : null}

      <section className="mt-6 flex flex-col gap-4 sm:gap-5">
        {isLoading ? (
          <ProviderCard>
            <p className="text-[16px] leading-7 text-[#6d737c]">
              Loading bookings...
            </p>
          </ProviderCard>
        ) : null}

        {!isLoading && bookings.length === 0 ? (
          <ProviderCard>
            <div className="text-center">
              <h2 className="text-[20px] font-extrabold leading-tight tracking-normal text-black sm:text-[23px]">
                {activeStatus === "pending"
                  ? "अभी कोई नई बुकिंग नहीं है।"
                  : "No declined bookings"}
              </h2>
              <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-6 tracking-normal text-[#6d737c] sm:text-[16px] sm:leading-7">
                {activeStatus === "pending"
                  ? "New bookings from customers will appear here in real-time."
                  : "Declined booking history will appear here."}
              </p>
              {activeStatus === "pending" ? (
                <Link
                  className="mx-auto mt-5 flex h-[46px] max-w-[220px] items-center justify-center rounded-lg bg-[#f9a21a] px-5 text-[15px] font-semibold tracking-normal text-white transition hover:bg-[#ee9914] sm:h-[48px] sm:text-[16px]"
                  href={categoryCount === 0 ? "/provider/categories" : "/provider/my-shop"}
                >
                  {categoryCount === 0 ? "Select Categories" : "My Shop"}
                </Link>
              ) : null}
            </div>
          </ProviderCard>
        ) : null}

        {bookings.map((booking) => (
          <BookingCard
            booking={booking}
            busyBookingId={busyBookingId}
            key={booking.id}
            onAccept={(nextBooking) => updateStatus(nextBooking, "accepted")}
            onDecline={(nextBooking) => updateStatus(nextBooking, "declined")}
            status={activeStatus}
          />
        ))}
      </section>
    </ProviderPageFrame>
  );
}
