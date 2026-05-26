"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAuthToken } from "@/hooks/use-auth-token";
import {
  getCurrentUser,
  getProviderCategories,
  getProviderProfile,
} from "@/services/auth-service";
import { useRouter } from "next/navigation";

type AuthRedirectGuardProps = {
  children: ReactNode;
};

function RedirectLoader() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f5fbfd] px-6 text-center text-[17px] leading-7 text-[#6d737c] sm:min-h-[calc(100vh-5rem)]">
      Loading NearFix...
    </main>
  );
}

export function AuthRedirectGuard({ children }: AuthRedirectGuardProps) {
  const router = useRouter();
  const { clearToken, isReady, token } = useAuthToken();
  const [allowedToken, setAllowedToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!isReady) {
      return () => {
        isMounted = false;
      };
    }

    if (!token) {
      return () => {
        isMounted = false;
      };
    }

    async function redirectAuthenticatedUser() {
      try {
        const user = await getCurrentUser(token as string);

        if (!isMounted) {
          return;
        }

        if (user.role === "customer") {
          router.replace("/customer/home");
          return;
        }

        if (user.role === "provider") {
          try {
            const [profile, categories] = await Promise.all([
              getProviderProfile(token as string),
              getProviderCategories(token as string),
            ]);
            if (profile.verificationStatus !== "approved") {
              router.replace("/provider/status");
              return;
            }
            router.replace(
              categories.categorySlugs.length > 0
                ? "/provider/dashboard"
                : "/provider/categories",
            );
          } catch {
            router.replace("/provider/status");
          }
          return;
        }

        if (user.role === "admin") {
          router.replace("/admin/dashboard");
          return;
        }

        setAllowedToken(token as string);
      } catch {
        clearToken();
      }
    }

    void redirectAuthenticatedUser();

    return () => {
      isMounted = false;
    };
  }, [clearToken, isReady, router, token]);

  if (isReady && token && allowedToken !== token) {
    return <RedirectLoader />;
  }

  return children;
}
