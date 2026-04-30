"use client";

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CustomerShell } from "@/components/customer/customer-shell";
import {
  otherServiceSlugs,
  serviceCategories,
  serviceCategoryBySlug,
} from "@/lib/service-categories";
import { getCategories } from "@/services/auth-service";

type CustomerService = {
  group: string;
  label: string;
  slug: string;
};

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

export default function OtherServicesPage() {
  const [services, setServices] = useState<CustomerService[]>(
    otherServiceSlugs
      .map((slug) => serviceCategoryBySlug[slug])
      .filter(Boolean),
  );

  useEffect(() => {
    let isMounted = true;
    getCategories()
      .then((categories) => {
        if (isMounted) {
          const otherServices = categories.filter(
            (category) => category.group === "Other Services",
          );
          setServices(
            otherServices.length > 0
              ? otherServices
              : serviceCategories.filter((category) => category.group === "Other Services"),
          );
        }
      })
      .catch(() => {
        // Static services remain available.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <CustomerShell>
      <div className="mx-auto w-full max-w-[492px] px-6 pb-10 pt-7 sm:max-w-[536px] sm:px-8 md:max-w-[880px] md:px-10">
        <div className="flex min-h-[46px] items-center gap-4 sm:min-h-[54px]">
          <Link
            aria-label="Back to customer home"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[28px] leading-none text-black transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#f9a21a] sm:h-10 sm:w-10 sm:text-[30px]"
            href="/customer/home"
          >
            <span aria-hidden="true">{"<"}</span>
          </Link>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-normal text-[#f9a21a] drop-shadow-[0_1px_1px_rgba(249,162,26,0.22)] sm:text-[30px] md:text-[35px]">
            Other Services
          </h1>
        </div>

        <section className="mt-7 rounded-xl border border-[#e7ecef] bg-white px-5 py-6 shadow-[0_2px_10px_rgba(15,23,42,0.07)] sm:px-6 sm:py-7 md:px-7">
          <h2 className="text-[23px] font-extrabold leading-tight tracking-normal text-black sm:text-[26px] md:text-[30px]">
            Available Services
          </h2>

          <div className="mt-7 divide-y divide-[#edf1f3]">
            {services.map((service) => (
              <Link
                className="flex min-h-[64px] items-center gap-4 py-3.5 text-black transition hover:text-[#f9a21a] sm:min-h-[74px] sm:py-4"
                href={`/customer/services/${service.slug}`}
                key={service.slug}
              >
                <span className="min-w-0 flex-1 text-[17px] font-normal leading-6 tracking-normal sm:text-[19px]">
                  {service.label}
                </span>
                <span className="shrink-0 text-[#6d737c]">
                  <ArrowRightIcon />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </CustomerShell>
  );
}
