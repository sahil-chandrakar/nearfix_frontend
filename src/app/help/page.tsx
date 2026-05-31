"use client";

import { useI18n } from "@/components/i18n/language-provider";
import Link from "next/link";
import {
  supportMailHref,
  supportTelHref,
} from "@/config/support";
import { useSupportDetails } from "@/hooks/use-support-details";

function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

export default function HelpPage() {
  const { language, t } = useI18n();
  const { supportDetails } = useSupportDetails();
  const helpHeading =
    language === "hi" ? supportDetails.helpHeadingHi : supportDetails.helpHeadingEn;
  const helpDescription =
    language === "hi" ? supportDetails.helpDescriptionHi : supportDetails.helpDescriptionEn;

  return (
    <main>
      <section className="border-b border-[#edf1f3] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[430px] items-center gap-6 px-8 md:h-20 md:max-w-[820px] lg:max-w-[1040px]">
          <Link
            aria-label={t("common.back")}
            className="text-black transition hover:text-[#f9a21a] focus:outline-none focus:ring-2 focus:ring-[#f9a21a]"
            href="/"
          >
            <BackIcon />
          </Link>
          <h1 className="text-[28px] font-extrabold leading-none tracking-normal text-[#f9a21a] drop-shadow-[0_1px_1px_rgba(249,162,26,0.22)] md:text-[32px]">
            {t("help.title")}
          </h1>
        </div>
      </section>

      <section className="px-4 pb-12 pt-7 sm:px-6 md:px-8 md:pb-20 md:pt-12 lg:px-10">
        <div className="mx-auto w-full max-w-[430px] md:max-w-[820px] lg:max-w-[1040px]">
          <article className="rounded-xl border border-[#e7ecef] bg-white px-6 py-7 shadow-[0_2px_12px_rgba(15,23,42,0.08)] md:max-w-2xl md:px-8 md:py-9">
            <h2 className="text-[25px] font-extrabold leading-tight tracking-normal text-black md:text-[30px]">
              {helpHeading}
            </h2>

            <p className="mt-5 text-[16px] font-normal leading-7 tracking-normal text-[#2f3338] md:max-w-xl md:text-[18px] md:leading-8">
              {helpDescription}
            </p>

            <div className="mt-6 flex flex-col gap-5 text-[#6d737c]">
              <a
                className="flex items-center gap-5 text-[16px] leading-none tracking-normal transition hover:text-[#f9a21a] md:text-[18px]"
                href={supportTelHref(supportDetails)}
              >
                <PhoneIcon />
                <span>{supportDetails.adminPhone}</span>
              </a>
              <a
                className="flex items-center gap-5 break-all text-[16px] leading-6 tracking-normal transition hover:text-[#f9a21a] md:text-[18px]"
                href={supportMailHref(supportDetails)}
              >
                <MailIcon />
                <span>{supportDetails.email}</span>
              </a>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
