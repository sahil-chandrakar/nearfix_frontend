"use client";

import type { FormEvent, MouseEvent } from "react";
import { useState } from "react";
import { AuthRedirectGuard } from "@/components/auth/auth-redirect-guard";
import {
  AuthCard,
  AuthLink,
  AuthPage,
  FieldStack,
  PrimaryButton,
  TextField,
} from "@/components/auth/marketplace-auth";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import {
  getProviderCategories,
  getProviderProfile,
  loginProvider,
} from "@/services/auth-service";
import { useRouter } from "next/navigation";

export default function ProviderLoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { setToken } = useAuthToken();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitLogin() {
    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const token = await loginProvider({ phone, password });
      setToken(token.accessToken);
      const [profile, categories] = await Promise.all([
        getProviderProfile(token.accessToken),
        getProviderCategories(token.accessToken),
      ]);
      if (profile.verificationStatus !== "approved") {
        router.push("/provider/status");
        return;
      }
      router.push(
        categories.categorySlugs.length > 0
          ? "/provider/dashboard"
          : "/provider/categories",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to login right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitLogin();
  }

  function handleButtonClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    void submitLogin();
  }

  return (
    <AuthRedirectGuard>
      <AuthPage subtitle={t("auth.providerPortal")}>
        <AuthCard
          description={t("auth.providerLoginDescription")}
          title={t("auth.providerLogin")}
        >
          <form onSubmit={handleSubmit}>
            <FieldStack>
              <TextField
                autoComplete="tel"
                inputMode="numeric"
                label={t("auth.registeredMobileNumber")}
                maxLength={10}
                onChange={(event) => setPhone(event.target.value)}
                pattern="[0-9]{10}"
                placeholder="7970054811"
                required
                type="tel"
                value={phone}
              />
              <TextField
                autoComplete="current-password"
                label={t("common.password")}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("auth.enterPassword")}
                required
                type="password"
                value={password}
              />
              <div className="-mt-3 text-right text-[15px] leading-5 tracking-normal">
                <AuthLink href="/contact">{t("auth.forgotPassword")}</AuthLink>
              </div>
              {error ? (
                <p className="text-[14px] leading-5 text-red-600">{error}</p>
              ) : null}
              <PrimaryButton
                disabled={isSubmitting}
                onClick={handleButtonClick}
                type="button"
              >
                {isSubmitting ? t("auth.loggingIn") : t("auth.loginToDashboard")}
              </PrimaryButton>
            </FieldStack>
          </form>

          <p className="mt-6 text-center text-[16px] leading-7 tracking-normal text-[#6d737c]">
            {t("auth.noProviderAccount")}{" "}
            <AuthLink href="/provider/register">{t("auth.registerYourShop")}</AuthLink>
          </p>
        </AuthCard>

        <p className="mt-8 text-center text-[16px] leading-7 tracking-normal">
          <AuthLink href="/customer/login">{t("auth.areCustomer")}</AuthLink>
        </p>
      </AuthPage>
    </AuthRedirectGuard>
  );
}
