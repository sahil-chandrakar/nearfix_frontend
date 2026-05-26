"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CustomerShell } from "@/components/customer/customer-shell";
import { ServiceIcon } from "@/components/customer/service-icon";
import { useI18n } from "@/components/i18n/language-provider";
import { SUPPORT_CONTACT } from "@/config/support";
import { apiUrl } from "@/lib/api-url";
import { categoryGroupLabel, categoryLabel } from "@/lib/localized-labels";
import {
  brandServices,
  homeCategoryGroups,
  personalCareAudiences,
  serviceCategories,
} from "@/lib/service-categories";
import { getCategories, getCustomerBanners } from "@/services/auth-service";

type CustomerService = {
  group: string;
  groupHi?: string;
  label: string;
  labelHi?: string;
  slug: string;
};

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BrandIcon({ index }: { index: number }) {
  const slugs = [
    "electronic-mechanic",
    "house-cleaning",
    "car-mechanic",
    "bike-mechanic",
    "bike-mechanic",
  ];

  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#defde7] text-[#36bf50] sm:h-16 sm:w-16">
      <ServiceIcon className="h-8 w-8 sm:h-9 sm:w-9" slug={slugs[index] ?? "other-services"} />
    </span>
  );
}

const fallbackBanners = [
  { alt: "NearFix home service banner", src: "/customer-banner-home-clean.png" },
  {
    alt: "Beauty and personal care banner",
    src: "/customer-banner-beauty-clean.png",
  },
];

export default function CustomerHomePage() {
  const { language, t } = useI18n();
  const [query, setQuery] = useState("");
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [availableCategories, setAvailableCategories] =
    useState<CustomerService[]>(serviceCategories);
  const [banners, setBanners] = useState(fallbackBanners);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return availableCategories;
    }

    return availableCategories.filter((category) =>
      categoryLabel(category, language).toLowerCase().includes(normalizedQuery),
    );
  }, [availableCategories, language, normalizedQuery]);

  useEffect(() => {
    let isMounted = true;

    getCategories()
      .then((categories) => {
        if (isMounted && categories.length > 0) {
          setAvailableCategories(categories);
        }
      })
      .catch(() => {
        // Static categories remain as a safe fallback.
      });

    getCustomerBanners()
      .then((nextBanners) => {
        if (isMounted && nextBanners.length > 0) {
          setBanners(
            nextBanners.map((banner) => ({
              alt: banner.altText,
              src: apiUrl(banner.imageUrl),
            })),
          );
          setActiveBannerIndex(0);
        }
      })
      .catch(() => {
        // Local banners remain as a safe fallback.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveBannerIndex((currentIndex) => (currentIndex + 1) % banners.length);
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [banners.length]);

  return (
    <CustomerShell>
      <div className="mx-auto w-full max-w-[492px] px-6 pb-10 pt-8 sm:max-w-[536px] sm:px-8 md:max-w-[880px] md:px-10">
        <label className="flex h-[56px] items-center gap-3 rounded-full border-2 border-[#f3d99b] bg-white px-5 text-[#9aa0a6] shadow-[0_1px_8px_rgba(249,162,26,0.15)] sm:h-[62px] sm:gap-4 sm:px-6">
          <SearchIcon />
          <input
            className="h-full min-w-0 flex-1 bg-transparent text-[18px] font-normal tracking-normal text-black outline-none placeholder:text-[#8f9499] sm:text-[21px]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("customer.searchServices")}
            type="search"
            value={query}
          />
        </label>

        <section
          aria-label="Featured services"
          className="mt-7 overflow-hidden rounded-2xl bg-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.12)]"
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeBannerIndex * 100}%)` }}
          >
            {banners.map((banner, index) => (
              <div
                className="relative h-[184px] min-w-full overflow-hidden bg-slate-700 sm:h-[214px] md:h-[252px]"
                key={banner.src}
              >
                <Image
                  alt={banner.alt}
                  className="object-cover"
                  fill
                  priority={index === 0}
                  sizes="(min-width: 768px) 880px, (min-width: 640px) 536px, 492px"
                  src={banner.src}
                />
              </div>
            ))}
          </div>
        </section>

        {normalizedQuery ? (
          <section className="mt-12">
            <h1 className="text-[26px] font-extrabold leading-tight tracking-normal text-black sm:text-[30px] md:text-[35px]">
              {t("common.services")}
            </h1>
            {filteredCategories.length === 0 ? (
              <p className="mt-5 text-[16px] leading-7 tracking-normal text-[#6d737c]">
                {t("customer.noServicesFound")}
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-6 md:gap-x-8">
                {filteredCategories.map((category) => (
                  <Link
                    className="flex min-h-[98px] flex-col items-center text-center text-black transition hover:text-[#f9a21a] sm:min-h-[110px]"
                    href={`/customer/services/${category.slug}`}
                    key={category.slug}
                  >
                    <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#fff4df] text-[#ee9f19] sm:h-[70px] sm:w-[70px] md:h-[76px] md:w-[76px]">
                      <ServiceIcon className="h-8 w-8 sm:h-[34px] sm:w-[34px]" slug={category.slug} />
                    </span>
                    <span className="mt-3 text-[13px] font-semibold leading-5 tracking-normal sm:mt-4 sm:text-[15px]">
                      {categoryLabel(category, language)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="mt-12">
              <h1 className="text-[26px] font-extrabold leading-tight tracking-normal text-black sm:text-[30px] md:text-[35px]">
                {t("customer.personalCare")}
              </h1>
              <div className="mt-8 grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-6 md:gap-x-8">
                {personalCareAudiences.map((audience) => (
                  <Link
                    className="flex min-h-[98px] flex-col items-center text-center text-black transition hover:text-[#f9a21a] sm:min-h-[110px]"
                    href={`/customer/personal-care/${audience.slug}`}
                    key={audience.slug}
                  >
                    <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#fff4df] text-[#ee9f19] sm:h-[70px] sm:w-[70px] md:h-[76px] md:w-[76px]">
                      <ServiceIcon className="h-8 w-8 sm:h-[34px] sm:w-[34px]" slug={audience.slug} />
                    </span>
                    <span className="mt-3 text-[13px] font-semibold leading-5 tracking-normal sm:mt-4 sm:text-[15px]">
                      {language === "hi" ? (audience.slug === "male" ? "पुरुष" : "महिला") : audience.label}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {homeCategoryGroups.map((group) => {
              const categories = availableCategories.filter(
                (category) => category.group === group,
              );
              const homeTiles =
                group === "Home Repairs & Maintenance"
                  ? [
                      ...categories,
                      {
                        group,
                        groupHi: "अन्य सेवाएं",
                        label: "Other Services",
                        labelHi: "अन्य सेवाएं",
                        slug: "other-services",
                      },
                    ]
                  : categories;

              return (
                <section className="mt-12" key={group}>
                  <h1 className="text-[26px] font-extrabold leading-tight tracking-normal text-black sm:text-[30px] md:text-[35px]">
                    {categoryGroupLabel(group, language)}
                  </h1>
                  <div className="mt-8 grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-6 md:gap-x-8">
                    {homeTiles.map((category) => (
                      <Link
                        className="flex min-h-[98px] flex-col items-center text-center text-black transition hover:text-[#f9a21a] sm:min-h-[110px]"
                        href={
                          category.slug === "other-services"
                            ? "/customer/other-services"
                            : `/customer/services/${category.slug}`
                        }
                        key={category.slug}
                      >
                        <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#fff4df] text-[#ee9f19] sm:h-[70px] sm:w-[70px] md:h-[76px] md:w-[76px]">
                          <ServiceIcon className="h-8 w-8 sm:h-[34px] sm:w-[34px]" slug={category.slug} />
                        </span>
                        <span className="mt-3 text-[13px] font-semibold leading-5 tracking-normal sm:mt-4 sm:text-[15px]">
                          {categoryLabel(category, language)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}

        <section className="mt-12">
          <h1 className="text-[26px] font-extrabold leading-tight tracking-normal text-black sm:text-[30px] md:text-[35px]">
            {t("customer.allBrandServices")}
          </h1>
          <div className="mt-7 flex flex-col gap-4 sm:gap-5">
            {brandServices.map((service, index) => (
              <div
                className="flex min-h-[84px] items-center gap-5 rounded-xl border border-[#e7ecef] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.07)] sm:min-h-[94px] sm:gap-6"
                key={`${service}-${index}`}
              >
                <BrandIcon index={index} />
                <p className="text-[16px] font-normal leading-6 tracking-normal text-[#34383d] sm:text-[18px] md:text-[20px] md:leading-7">
                  {service}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="py-10 text-center text-[16px] leading-8 tracking-normal text-[#b6bdc5] sm:py-12 sm:text-[18px]">
          <p>Nearfix.in</p>
          <p className="mt-5">{language === "hi" ? "हेल्पलाइन" : "Helpline"}: {SUPPORT_CONTACT.adminPhone}</p>
          <p>{t("common.email")}: {SUPPORT_CONTACT.email}</p>
        </footer>
      </div>
    </CustomerShell>
  );
}
