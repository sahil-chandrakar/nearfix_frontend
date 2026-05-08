"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { ServiceIcon } from "@/components/customer/service-icon";
import { useI18n } from "@/components/i18n/language-provider";
import { categoryLabel } from "@/lib/localized-labels";
import {
  personalCareAudienceBySlug,
  personalCareServiceDescriptions,
  personalCareServiceDescriptionsHi,
  serviceCategoryBySlug,
} from "@/lib/service-categories";

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function PersonalCareServicesPage() {
  const { language, t } = useI18n();
  const params = useParams<{ audience: string }>();
  const audience =
    params.audience === "male" || params.audience === "female"
      ? personalCareAudienceBySlug[params.audience]
      : null;
  const services =
    audience?.serviceSlugs
      .map((slug) => serviceCategoryBySlug[slug])
      .filter(Boolean) ?? [];

  return (
    <CustomerShell>
      <div className="mx-auto w-full max-w-[492px] px-6 pb-10 pt-7 sm:max-w-[536px] sm:px-8 md:max-w-[880px] md:px-10">
        <div className="flex min-h-[46px] items-center gap-4 sm:min-h-[54px]">
          <Link
            aria-label={t("common.back")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[28px] leading-none text-black transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#f9a21a] sm:h-10 sm:w-10 sm:text-[30px]"
            href="/customer/home"
          >
            <span aria-hidden="true">{"<"}</span>
          </Link>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-normal text-[#f9a21a] drop-shadow-[0_1px_1px_rgba(249,162,26,0.22)] sm:text-[30px] md:text-[35px]">
            {audience
              ? language === "hi"
                ? audience.slug === "male"
                  ? "पुरुष सेवाएं"
                  : "महिला सेवाएं"
                : audience.title
              : t("common.services")}
          </h1>
        </div>

        {!audience ? (
          <section className="mt-7 rounded-xl border border-[#e7ecef] bg-white px-5 py-7 text-center shadow-[0_2px_10px_rgba(15,23,42,0.07)] sm:px-6 sm:py-8">
            <h2 className="text-[22px] font-extrabold tracking-normal text-black sm:text-[24px]">
              {t("customer.noServicesFound")}
            </h2>
          </section>
        ) : (
          <section className="mt-7 rounded-xl border border-[#e7ecef] bg-white px-5 py-6 shadow-[0_2px_10px_rgba(15,23,42,0.07)] sm:px-6 sm:py-7 md:px-7">
            <h2 className="text-[23px] font-extrabold leading-tight tracking-normal text-black sm:text-[26px] md:text-[30px]">
              {t("customer.selectService")}
            </h2>
            <p className="mt-2 text-[15px] leading-6 tracking-normal text-[#6d737c] sm:text-[16px] sm:leading-7">
              {t("customer.selectServiceDescription")}
            </p>

            <div className="mt-7 divide-y divide-[#edf1f3]">
              {services.map((service) => (
                <Link
                  className="flex min-h-[82px] items-center gap-4 py-4 text-black transition hover:text-[#f9a21a] sm:min-h-[94px] sm:gap-5"
                  href={`/customer/services/${service.slug}`}
                  key={service.slug}
                >
                  <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-[#fff4df] text-[#ee9f19] sm:h-[62px] sm:w-[62px]">
                    <ServiceIcon
                      className="h-7 w-7 sm:h-8 sm:w-8"
                      slug={service.slug}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-bold leading-6 tracking-normal sm:text-[19px]">
                      {categoryLabel(service, language)}
                    </span>
                    <span className="mt-0.5 block text-[14px] font-normal leading-5 tracking-normal text-[#6d737c] sm:text-[15px] sm:leading-6">
                      {language === "hi"
                        ? personalCareServiceDescriptionsHi[service.slug]
                        : personalCareServiceDescriptions[service.slug]}
                    </span>
                  </span>
                  <span className="shrink-0 text-[#6d737c]">
                    <ArrowRightIcon />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </CustomerShell>
  );
}
