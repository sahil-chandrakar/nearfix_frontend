"use client";

import { useEffect, useState } from "react";
import { AuthCard, AuthPage, PrimaryButton } from "@/components/auth/marketplace-auth";
import { ServiceIcon } from "@/components/customer/service-icon";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { categoryGroupLabel, categoryLabel } from "@/lib/localized-labels";
import {
  categoryGroups,
  serviceCategories,
} from "@/lib/service-categories";
import {
  getCategories,
  getProviderCategories,
  saveProviderCategories,
} from "@/services/auth-service";
import type { ApiServiceCategory } from "@/types/auth";
import { useRouter } from "next/navigation";

export default function ProviderCategoriesPage() {
  const { language, t } = useI18n();
  const router = useRouter();
  const { isReady, token } = useAuthToken();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] =
    useState<ApiServiceCategory[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!token) {
      router.replace("/provider/login");
      return;
    }

    let isMounted = true;

    Promise.all([getCategories(), getProviderCategories(token)])
      .then(([apiCategories, categories]) => {
        if (isMounted) {
          const categorySource =
            apiCategories.length > 0 ? apiCategories : serviceCategories;
          const validSlugs = new Set(
            categorySource.map((category) => category.slug),
          );
          setAvailableCategories(apiCategories);
          setSelectedSlugs(
            categories.categorySlugs.filter((slug) => validSlugs.has(slug)),
          );
          setError("");
        }
      })
      .catch((caughtError) => {
        if (isMounted) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : t("provider.loadingCategories"),
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

  function toggleCategory(slug: string) {
    setSelectedSlugs((currentSlugs) =>
      currentSlugs.includes(slug)
        ? currentSlugs.filter((currentSlug) => currentSlug !== slug)
        : [...currentSlugs, slug],
    );
  }

  async function handleSave() {
    if (!token) {
      router.replace("/provider/login");
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const categories = await saveProviderCategories(token, selectedSlugs);
      setSelectedSlugs(categories.categorySlugs);
      setMessage(t("provider.categoriesSaved"));
      router.push("/provider/dashboard");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : t("provider.saveCategories"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPage subtitle={t("provider.categorySelection")}>
      <AuthCard
        description={t("provider.categorySelectionDescription")}
        title={t("provider.yourServices")}
      >
        {isLoading ? (
          <p className="text-[16px] leading-7 text-[#6d737c]">
            {t("provider.loadingCategories")}
          </p>
        ) : null}

        {error ? (
          <p className="mb-5 text-[14px] leading-5 text-red-600">{error}</p>
        ) : null}

        {message ? (
          <p className="mb-5 text-[14px] leading-5 text-[#2aa946]">{message}</p>
        ) : null}

        <div className="space-y-7 sm:space-y-9">
          {categoryGroups.map((group) => (
            <section key={group}>
              <h2 className="text-[19px] font-extrabold tracking-normal text-black sm:text-[21px]">
                {categoryGroupLabel(group, language)}
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 md:grid-cols-3">
                {(availableCategories.length > 0
                  ? availableCategories
                  : serviceCategories
                )
                  .filter((category) => category.group === group)
                  .map((category) => {
                    const isSelected = selectedSlugs.includes(category.slug);

                    return (
                      <button
                        className={`flex min-h-[96px] flex-col items-center justify-center rounded-xl border px-3 py-3 text-center transition sm:min-h-[108px] sm:py-4 ${
                          isSelected
                            ? "border-[#f9a21a] bg-[#fff8ec]"
                            : "border-[#e7ecef] bg-white hover:border-[#f9a21a]"
                        }`}
                        key={category.slug}
                        onClick={() => toggleCategory(category.slug)}
                        type="button"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4df] text-[#f9a21a] sm:h-14 sm:w-14">
                          <ServiceIcon className="h-7 w-7 sm:h-8 sm:w-8" slug={category.slug} />
                        </span>
                        <span className="mt-2 text-[13px] font-semibold leading-5 tracking-normal text-[#2f3338] sm:mt-3 sm:text-[14px]">
                          {categoryLabel(category, language)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8">
          <PrimaryButton disabled={isSubmitting} onClick={handleSave}>
            {isSubmitting ? t("common.saving") : t("provider.saveCategories")}
          </PrimaryButton>
        </div>
      </AuthCard>
    </AuthPage>
  );
}
