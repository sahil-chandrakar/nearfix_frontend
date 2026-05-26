import { apiUrl } from "@/lib/api-url";
import { apiFetch, ApiError } from "@/lib/http-client";
import type { AuthToken } from "@/types/auth";
import type {
  AdminAuditLog,
  AdminBanner,
  AdminBannerSettings,
  AdminBooking,
  AdminCustomer,
  AdminDocumentRequest,
  AdminProvider,
  AdminService,
  AdminSummary,
} from "@/types/admin";

type AdminStatus = "pending" | "approved" | "rejected";
type BookingStatus = "pending" | "accepted" | "declined";

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function queryString(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }
  const nextQuery = query.toString();
  return nextQuery ? `?${nextQuery}` : "";
}

export function loginAdmin(payload: { phone: string; password: string }) {
  return apiFetch<AuthToken>("/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAdminSummary(accessToken: string) {
  return apiFetch<AdminSummary>("/admin/summary", {
    cache: "no-store",
    headers: authHeaders(accessToken),
  });
}

export function getAdminProviders(
  accessToken: string,
  filters: { status?: AdminStatus | "all"; q?: string; category?: string } = {},
) {
  return apiFetch<AdminProvider[]>(
    `/admin/providers${queryString({
      category: filters.category,
      q: filters.q,
      status: filters.status && filters.status !== "all" ? filters.status : undefined,
    })}`,
    { headers: authHeaders(accessToken) },
  );
}

export function getAdminProvider(accessToken: string, providerId: number) {
  return apiFetch<AdminProvider>(`/admin/providers/${providerId}`, {
    headers: authHeaders(accessToken),
  });
}

export function updateAdminProviderStatus(
  accessToken: string,
  providerId: number,
  payload: { verificationStatus: AdminStatus; reason?: string },
) {
  return apiFetch<AdminProvider>(
    `/admin/providers/${providerId}/verification-status`,
    {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    },
  );
}

export function getAdminDocuments(
  accessToken: string,
  status: AdminStatus | "all" = "pending",
) {
  return apiFetch<AdminDocumentRequest[]>(
    `/admin/provider-document-change-requests${queryString({
      status: status === "all" ? undefined : status,
    })}`,
    { headers: authHeaders(accessToken) },
  );
}

export function reviewAdminDocument(
  accessToken: string,
  requestId: number,
  payload: { status: "approved" | "rejected"; reason?: string },
) {
  return apiFetch<AdminDocumentRequest>(
    `/admin/provider-document-change-requests/${requestId}`,
    {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    },
  );
}

export function getAdminCustomers(accessToken: string, q?: string) {
  return apiFetch<AdminCustomer[]>(
    `/admin/customers${queryString({ q })}`,
    { headers: authHeaders(accessToken) },
  );
}

export function getAdminBookings(
  accessToken: string,
  filters: { status?: BookingStatus | "all"; category?: string; q?: string } = {},
) {
  return apiFetch<AdminBooking[]>(
    `/admin/bookings${queryString({
      category: filters.category,
      q: filters.q,
      status: filters.status && filters.status !== "all" ? filters.status : undefined,
    })}`,
    { headers: authHeaders(accessToken) },
  );
}

export function updateAdminUserActive(
  accessToken: string,
  userId: number,
  isActive: boolean,
) {
  return apiFetch<AdminCustomer>(`/admin/users/${userId}/active`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ isActive }),
  });
}

export function resetAdminUserPassword(
  accessToken: string,
  userId: number,
  newPassword: string,
) {
  return apiFetch<void>(`/admin/users/${userId}/password`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ newPassword }),
  });
}

export function getAdminAuditLogs(accessToken: string) {
  return apiFetch<AdminAuditLog[]>("/admin/audit-logs", {
    cache: "no-store",
    headers: authHeaders(accessToken),
  });
}

export function getAdminBanners(accessToken: string) {
  return apiFetch<AdminBanner[]>("/admin/banners", {
    headers: authHeaders(accessToken),
  });
}

export function createAdminBanner(accessToken: string, payload: FormData) {
  return apiFetch<AdminBanner>("/admin/banners", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: payload,
  });
}

export function updateAdminBanner(
  accessToken: string,
  bannerId: number,
  payload: Partial<Pick<AdminBanner, "altText" | "displayOrder" | "isActive">>,
) {
  return apiFetch<AdminBanner>(`/admin/banners/${bannerId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminBanner(accessToken: string, bannerId: number) {
  return apiFetch<void>(`/admin/banners/${bannerId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

export function getAdminBannerSettings(accessToken: string) {
  return apiFetch<AdminBannerSettings>("/admin/banner-settings", {
    headers: authHeaders(accessToken),
  });
}

export function updateAdminBannerSettings(
  accessToken: string,
  bannerLimit: number,
) {
  return apiFetch<AdminBannerSettings>("/admin/banner-settings", {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ bannerLimit }),
  });
}

export function getAdminServices(accessToken: string) {
  return apiFetch<AdminService[]>("/admin/services", {
    headers: authHeaders(accessToken),
  });
}

export function createAdminService(
  accessToken: string,
  payload: { label: string; labelHi: string },
) {
  return apiFetch<AdminService>("/admin/services", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export function updateAdminService(
  accessToken: string,
  serviceId: number,
  payload: Partial<Pick<AdminService, "label" | "labelHi" | "displayOrder" | "isActive">>,
) {
  return apiFetch<AdminService>(`/admin/services/${serviceId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminService(accessToken: string, serviceId: number) {
  return apiFetch<void>(`/admin/services/${serviceId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

export async function fetchAdminBlobUrl(accessToken: string, path: string) {
  const response = await fetch(apiUrl(path), {
    headers: authHeaders(accessToken),
  });
  if (!response.ok) {
    throw new ApiError(`Unable to open file (${response.status})`, response.status);
  }
  return URL.createObjectURL(await response.blob());
}
