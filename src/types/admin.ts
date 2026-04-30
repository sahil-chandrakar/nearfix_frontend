import type {
  ApiServiceCategory,
  Booking,
  ProviderDocumentChangeRequest,
  ProviderProfile,
} from "@/types/auth";

export type AdminSummary = {
  totalCustomers: number;
  totalProviders: number;
  pendingProviders: number;
  approvedProviders: number;
  rejectedProviders: number;
  pendingDocumentRequests: number;
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  declinedBookings: number;
  activeBanners: number;
  activeServices: number;
};

export type AdminProvider = ProviderProfile & {
  categorySlugs: string[];
  userIsActive: boolean;
};

export type AdminCustomerPhoneHistory = {
  id: number;
  oldPhone: string | null;
  newPhone: string;
  changedAt: string;
};

export type AdminCustomer = {
  id: number;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: "customer" | "provider" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  phoneHistory: AdminCustomerPhoneHistory[];
};

export type AdminAuditLog = {
  id: number;
  adminUserId: number | null;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type AdminBanner = {
  id: number;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminBannerSettings = {
  bannerLimit: number;
};

export type AdminBooking = Booking;

export type AdminDocumentRequest = ProviderDocumentChangeRequest;

export type AdminService = ApiServiceCategory;
