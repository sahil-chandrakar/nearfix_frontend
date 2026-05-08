"use client";

import { AuthRedirectGuard } from "@/components/auth/auth-redirect-guard";
import { useI18n } from "@/components/i18n/language-provider";
import Link from "next/link";

type HomeCard = {
  titleKey: "home.forCustomers" | "home.forProviders";
  descriptionKey: "home.forCustomersDescription" | "home.forProvidersDescription";
  buttonLabelKey: "home.findServices" | "home.providerPortal";
  href: string;
  icon: "customer" | "provider";
};

const cards: HomeCard[] = [
  {
    titleKey: "home.forCustomers",
    descriptionKey: "home.forCustomersDescription",
    buttonLabelKey: "home.findServices",
    href: "/customer/login",
    icon: "customer",
  },
  {
    titleKey: "home.forProviders",
    descriptionKey: "home.forProvidersDescription",
    buttonLabelKey: "home.providerPortal",
    href: "/provider/login",
    icon: "provider",
  },
];

function ServiceIcon({ type }: { type: HomeCard["icon"] }) {
  if (type === "provider") {
    return (
      <svg
        aria-hidden="true"
        className="h-7 w-7 md:h-10 md:w-10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
        viewBox="0 0 24 24"
      >
        <path d="M14.7 6.3a4.3 4.3 0 0 0 5.9 5.9L12 20.8a2.8 2.8 0 0 1-4-4l8.6-8.6Z" />
        <path d="m16 5 3 3" />
        <path d="m5 19-2 2" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7 md:h-10 md:w-10"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8" r="3.2" />
      <path d="M6.2 19a5.8 5.8 0 0 1 11.6 0" />
    </svg>
  );
}

export default function Home() {
  const { t } = useI18n();

  return (
    <AuthRedirectGuard>
      <main className="px-4 pb-12 pt-7 sm:px-6 md:px-8 md:pb-20 md:pt-14 lg:px-10">
        <div className="mx-auto flex w-full max-w-[430px] flex-col items-center md:max-w-[820px] lg:max-w-[1040px]">
          <h1 className="w-full text-center text-[22px] font-normal leading-8 tracking-normal text-[#5d6670] sm:text-2xl md:text-[30px] md:leading-10 lg:text-[34px]">
            {t("home.headline")}
          </h1>

          <section className="mt-8 flex w-full flex-col gap-7 md:mt-14 md:grid md:grid-cols-2 md:gap-6 lg:gap-8">
            {cards.map((card) => (
              <article
                className="flex w-full flex-col items-center rounded-xl border border-[#e7ecef] bg-white px-6 py-6 text-center shadow-[0_2px_12px_rgba(15,23,42,0.08)] md:min-h-[360px] md:px-8 md:py-10 lg:min-h-[380px] lg:px-10"
                key={card.titleKey}
              >
                <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#fff3df] text-[#f5a21a] md:h-24 md:w-24">
                  <ServiceIcon type={card.icon} />
                </div>

                <h2 className="mt-[18px] text-[23px] font-bold leading-7 tracking-normal text-black md:mt-8 md:text-[28px] md:leading-8 lg:text-[30px]">
                  {t(card.titleKey)}
                </h2>
                <p className="mt-2.5 max-w-[330px] text-[15px] font-normal leading-6 tracking-normal text-[#7a7f86] md:mt-4 md:max-w-[360px] md:text-[18px] md:leading-7">
                  {t(card.descriptionKey)}
                </p>

                <Link
                  className="mt-[18px] flex h-12 w-full items-center justify-center rounded-lg bg-[#f9a21a] px-5 text-[18px] font-medium tracking-normal text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-[#ee9914] focus:outline-none focus:ring-2 focus:ring-[#f9a21a] focus:ring-offset-2 focus:ring-offset-white md:mt-auto md:h-[58px] md:text-[21px]"
                  href={card.href}
                >
                  {t(card.buttonLabelKey)}
                </Link>
              </article>
            ))}
          </section>
        </div>
      </main>
    </AuthRedirectGuard>
  );
}
