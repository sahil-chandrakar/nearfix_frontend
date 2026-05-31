import type { Booking } from "@/types/auth";

export type BookingNotificationType =
  | "booking_created"
  | "booking_accepted"
  | "booking_declined";

export type BookingNotificationPayload = {
  type: BookingNotificationType;
  booking: Booking;
};

export type UserLoggedInNotificationPayload = {
  type: "user_logged_in";
  user: {
    id: number;
    role: "customer" | "provider";
    displayName: string;
  };
  occurredAt: string;
};

export type AppNotificationPayload =
  | BookingNotificationPayload
  | UserLoggedInNotificationPayload;

export const BOOKING_NOTIFICATION_EVENT = "nearfix-booking-notification";

export function dispatchBookingNotification(
  payload: BookingNotificationPayload,
) {
  window.dispatchEvent(
    new CustomEvent<BookingNotificationPayload>(BOOKING_NOTIFICATION_EVENT, {
      detail: payload,
    }),
  );
}

export function isBookingNotificationPayload(
  value: unknown,
): value is BookingNotificationPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<BookingNotificationPayload>;
  return (
    (candidate.type === "booking_created" ||
      candidate.type === "booking_accepted" ||
      candidate.type === "booking_declined") &&
    Boolean(candidate.booking) &&
    typeof candidate.booking === "object"
  );
}

export function isUserLoggedInNotificationPayload(
  value: unknown,
): value is UserLoggedInNotificationPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<UserLoggedInNotificationPayload>;
  const user = candidate.user;
  return (
    candidate.type === "user_logged_in" &&
    Boolean(user) &&
    typeof user === "object" &&
    typeof user.id === "number" &&
    (user.role === "customer" || user.role === "provider") &&
    typeof user.displayName === "string" &&
    typeof candidate.occurredAt === "string"
  );
}

export function isAppNotificationPayload(
  value: unknown,
): value is AppNotificationPayload {
  return (
    isBookingNotificationPayload(value) ||
    isUserLoggedInNotificationPayload(value)
  );
}
