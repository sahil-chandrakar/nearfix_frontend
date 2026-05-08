"use client";

import { useEffect, useState } from "react";
import { AuthCard, AuthPage } from "@/components/auth/marketplace-auth";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import type { TranslationKey } from "@/lib/i18n";
import { ApiError } from "@/lib/http-client";
import { getProviderCategories, getProviderProfile } from "@/services/auth-service";
import type { ProviderProfile } from "@/types/auth";
import { useRouter } from "next/navigation";

export default function ProviderStatusPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { isReady, token } = useAuthToken();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [categoryCount, setCategoryCount] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    router.replace("/provider/dashboard");
  }, [router]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!token) {
      router.replace("/provider/login");
      return;
    }

    let isMounted = true;

    Promise.all([getProviderProfile(token), getProviderCategories(token)])
      .then(([nextProfile, categories]) => {
        if (isMounted) {
          setProfile(nextProfile);
          setCategoryCount(categories.categorySlugs.length);
          setError("");
        }
      })
      .catch((caughtError) => {
        if (isMounted) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : t("provider.loadingStatus"),
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isReady, router, t, token]);

  return (
    <AuthPage subtitle={t("auth.providerPortal")}>
      <AuthCard
        description={t("provider.statusDescription")}
        title={t("provider.statusTitle")}
      >
        {isLoading ? (
          <p className="text-[16px] leading-7 text-[#6d737c]">
            {t("provider.loadingStatus")}
          </p>
        ) : null}

        {error ? (
          <p className="text-[16px] leading-7 text-red-600">{error}</p>
        ) : null}

        {profile ? (
          <div className="space-y-4 text-[16px] leading-7 text-[#4d525a]">
            <p>
              <span className="font-semibold text-black">{t("common.shop")}:</span>{" "}
              {profile.shopCompanyName}
            </p>
            <p>
              <span className="font-semibold text-black">{t("provider.ownerName")}:</span>{" "}
              {profile.ownerName}
            </p>
            <p>
              <span className="font-semibold text-black">{t("common.status")}:</span>{" "}
              <span className="font-semibold capitalize text-[#d69a2d]">
                {t(`status.${profile.verificationStatus}` as TranslationKey)}
              </span>
            </p>
            <p>
              <span className="font-semibold text-black">{t("common.categories")}:</span>{" "}
              {categoryCount > 0 ? categoryCount : t("provider.notSelected")}
            </p>
            <a
              className="flex h-[52px] items-center justify-center rounded-lg bg-[#f9a21a] px-5 text-[17px] font-semibold tracking-normal text-white transition hover:bg-[#ee9914]"
              href="/provider/categories"
            >
              {categoryCount > 0
                ? t("provider.manageCategories")
                : t("provider.selectCategories")}
            </a>
          </div>
        ) : null}
      </AuthCard>
    </AuthPage>
  );
}
