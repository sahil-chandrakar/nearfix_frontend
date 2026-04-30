export type User = {
  id: number;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: "customer" | "provider" | "admin";
  isActive: boolean;
  isSuperuser: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type RegisterPayload = {
  email: string;
  password: string;
  fullName?: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthToken = {
  accessToken: string;
  tokenType: "bearer";
};

export type PhoneLoginPayload = {
  phone: string;
  password: string;
};

export type CustomerRegisterPayload = {
  name: string;
  phone: string;
  password: string;
};

export type CustomerProfileUpdatePayload = {
  name: string;
  phone: string;
};

export type ProviderProfile = {
  id: number;
  userId: number;
  shopCompanyName: string;
  ownerName: string;
  whatsappMobileNumber: string;
  email: string;
  aadhaarFrontPath: string;
  aadhaarBackPath: string;
  paymentBillPath: string;
  electricityBillPath: string;
  latitude: number | null;
  longitude: number | null;
  verificationStatus: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiServiceCategory = {
  id: number | null;
  slug: string;
  label: string;
  group: string;
  isActive: boolean;
  displayOrder: number;
};

export type ProviderCategories = {
  categorySlugs: string[];
};

export type CustomerProviderResult = {
  providerId: number;
  shopCompanyName: string;
  ownerName: string;
  whatsappMobileNumber: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  verificationStatus: "pending" | "approved" | "rejected";
  categorySlugs: string[];
  distanceKm: number | null;
};

export type CustomerBanner = {
  id: number;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BookingStatus = "pending" | "accepted" | "declined";

export type Booking = {
  id: number;
  customerId: number;
  providerProfileId: number;
  categorySlug: string;
  serviceLabel: string;
  status: BookingStatus;
  customerPhone: string | null;
  customerName: string | null;
  providerPhone: string;
  shopCompanyName: string;
  ownerName: string;
  distanceKm: number | null;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
};

export type CustomerBooking = Booking;
export type ProviderBooking = Booking;

export type BookingCreatePayload = {
  providerProfileId: number;
  categorySlug: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type ProviderProfileUpdatePayload = {
  shopCompanyName: string;
  ownerName: string;
  whatsappMobileNumber: string;
  email: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type ProviderPasswordUpdatePayload = {
  currentPassword: string;
  newPassword: string;
};

export type ProviderDocumentChangeRequest = {
  id: number;
  providerProfileId: number;
  documentType:
    | "aadhaar_front"
    | "aadhaar_back"
    | "payment_bill"
    | "electricity_bill";
  documentPath: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  reviewedByAdminId: number | null;
  createdAt: string;
  reviewedAt: string | null;
};
