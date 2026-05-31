import type { SupportDetails } from "@/types/support";

export const DEFAULT_SUPPORT_DETAILS: SupportDetails = {
  footerSiteName: "Nearfix.in",
  adminPhone: "7970054811",
  email: "nearfix12132550@gmail.com",
  helpHeadingEn: "Help & Support",
  helpHeadingHi: "मदद और सपोर्ट",
  helpDescriptionEn: "For any help or support, please contact us using the details below:",
  helpDescriptionHi: "किसी भी मदद के लिए नीचे दिए गए नंबर या ईमेल पर संपर्क करें:",
};

export const SUPPORT_CONTACT = {
  adminPhone: DEFAULT_SUPPORT_DETAILS.adminPhone,
  email: DEFAULT_SUPPORT_DETAILS.email,
} as const;

export function supportTelHref(details: Pick<SupportDetails, "adminPhone">) {
  return `tel:${details.adminPhone}`;
}

export function supportMailHref(details: Pick<SupportDetails, "email">) {
  return `mailto:${details.email}`;
}

export const SUPPORT_TEL_HREF = supportTelHref(DEFAULT_SUPPORT_DETAILS);
export const SUPPORT_MAIL_HREF = supportMailHref(DEFAULT_SUPPORT_DETAILS);
