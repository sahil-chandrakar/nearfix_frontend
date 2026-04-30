"use client";

import { useEffect, useState } from "react";
import { AuthCard, AuthPage } from "@/components/auth/marketplace-auth";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { getProviderCategories, getProviderProfile } from "@/services/auth-service";
import type { ProviderProfile } from "@/types/auth";
import { useRouter } from "next/navigation";

export default function ProviderStatusPage() {
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
              : "Unable to load your provider status.",
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
  }, [isReady, router, token]);

  return (
    <AuthPage subtitle="Service Provider Portal">
      <AuthCard
        description="Your shop verification details will appear here."
        title="Provider Status"
      >
        {isLoading ? (
          <p className="text-[16px] leading-7 text-[#6d737c]">
            Loading your provider status...
          </p>
        ) : null}

        {error ? (
          <p className="text-[16px] leading-7 text-red-600">{error}</p>
        ) : null}

        {profile ? (
          <div className="space-y-4 text-[16px] leading-7 text-[#4d525a]">
            <p>
              <span className="font-semibold text-black">Shop:</span>{" "}
              {profile.shopCompanyName}
            </p>
            <p>
              <span className="font-semibold text-black">Owner:</span>{" "}
              {profile.ownerName}
            </p>
            <p>
              <span className="font-semibold text-black">Status:</span>{" "}
              <span className="font-semibold capitalize text-[#d69a2d]">
                {profile.verificationStatus}
              </span>
            </p>
            <p>
              <span className="font-semibold text-black">Categories:</span>{" "}
              {categoryCount > 0 ? `${categoryCount} selected` : "Not selected"}
            </p>
            <a
              className="flex h-[52px] items-center justify-center rounded-lg bg-[#f9a21a] px-5 text-[17px] font-semibold tracking-normal text-white transition hover:bg-[#ee9914]"
              href="/provider/categories"
            >
              {categoryCount > 0 ? "Manage Categories" : "Select Categories"}
            </a>
          </div>
        ) : null}
      </AuthCard>
    </AuthPage>
  );
}
