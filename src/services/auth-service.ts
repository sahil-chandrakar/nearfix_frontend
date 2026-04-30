import { apiFetch } from "@/lib/http-client";
import type {
  AuthToken,
  ApiServiceCategory,
  BookingCreatePayload,
  CustomerBooking,
  CustomerProfileUpdatePayload,
  CustomerProviderResult,
  CustomerBanner,
  CustomerRegisterPayload,
  LoginPayload,
  BookingStatus,
  ProviderCategories,
  ProviderBooking,
  ProviderDocumentChangeRequest,
  ProviderPasswordUpdatePayload,
  PhoneLoginPayload,
  ProviderProfile,
  ProviderProfileUpdatePayload,
  RegisterPayload,
  User,
} from "@/types/auth";

export function registerUser(payload: RegisterPayload) {
  return apiFetch<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload) {
  return apiFetch<AuthToken>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(accessToken: string) {
  return apiFetch<User>("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function registerCustomer(payload: CustomerRegisterPayload) {
  return apiFetch<AuthToken>("/customer/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginCustomer(payload: PhoneLoginPayload) {
  return apiFetch<AuthToken>("/customer/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerProvider(payload: FormData) {
  return apiFetch<AuthToken>("/provider/register", {
    method: "POST",
    body: payload,
  });
}

export function loginProvider(payload: PhoneLoginPayload) {
  return apiFetch<AuthToken>("/provider/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProviderProfile(accessToken: string) {
  return apiFetch<ProviderProfile>("/provider/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getCategories() {
  return apiFetch<ApiServiceCategory[]>("/categories");
}

export function getCustomerBanners() {
  return apiFetch<CustomerBanner[]>("/customer/banners");
}

export function getProviderCategories(accessToken: string) {
  return apiFetch<ProviderCategories>("/provider/categories", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function saveProviderCategories(
  accessToken: string,
  categorySlugs: string[],
) {
  return apiFetch<ProviderCategories>("/provider/categories", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ categorySlugs }),
  });
}

export function getCustomerBookings(accessToken: string) {
  return apiFetch<CustomerBooking[]>("/customer/bookings", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createCustomerBooking(
  accessToken: string,
  payload: BookingCreatePayload,
) {
  return apiFetch<CustomerBooking>("/customer/bookings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateCustomerProfile(
  accessToken: string,
  payload: CustomerProfileUpdatePayload,
) {
  return apiFetch<User>("/customer/me", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function getCustomerProviders(
  accessToken: string,
  categorySlug: string,
  coords?: { lat: number; lng: number } | null,
) {
  const params = new URLSearchParams({ category: categorySlug });

  if (coords) {
    params.set("lat", String(coords.lat));
    params.set("lng", String(coords.lng));
  }

  return apiFetch<CustomerProviderResult[]>(
    `/customer/providers?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}

export function getProviderBookings(
  accessToken: string,
  status: BookingStatus,
) {
  const params = new URLSearchParams({ status });

  return apiFetch<ProviderBooking[]>(
    `/provider/bookings?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}

export function updateProviderBookingStatus(
  accessToken: string,
  bookingId: number,
  status: Exclude<BookingStatus, "pending">,
) {
  return apiFetch<ProviderBooking>(`/provider/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ status }),
  });
}

export function updateProviderProfile(
  accessToken: string,
  payload: ProviderProfileUpdatePayload,
) {
  return apiFetch<ProviderProfile>("/provider/me", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateProviderPassword(
  accessToken: string,
  payload: ProviderPasswordUpdatePayload,
) {
  return apiFetch<void>("/provider/password", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function getProviderDocumentChangeRequests(accessToken: string) {
  return apiFetch<ProviderDocumentChangeRequest[]>(
    "/provider/document-change-requests",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}

export function createProviderDocumentChangeRequests(
  accessToken: string,
  payload: FormData,
) {
  return apiFetch<ProviderDocumentChangeRequest[]>(
    "/provider/document-change-requests",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: payload,
    },
  );
}

export function logoutUser(accessToken?: string) {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  return apiFetch<void>("/auth/logout", {
    method: "POST",
    headers,
  });
}
