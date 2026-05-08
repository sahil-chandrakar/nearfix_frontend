"use client";

import type { FormEvent } from "react";
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
import { loginCustomer } from "@/services/auth-service";
import { useRouter } from "next/navigation";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { setToken } = useAuthToken();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const token = await loginCustomer({ phone, password });
      setToken(token.accessToken);
      router.push("/customer/home");
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

  return (
    <AuthRedirectGuard>
      <AuthPage subtitle={t("auth.customerPortal")}>
        <AuthCard
          description={t("auth.customerLoginDescription")}
          title={t("auth.customerLogin")}
        >
          <form onSubmit={handleSubmit}>
            <FieldStack>
              <TextField
                autoComplete="tel"
                inputMode="numeric"
                label={t("common.mobileNumber")}
                maxLength={10}
                onChange={(event) => setPhone(event.target.value)}
                pattern="[0-9]{10}"
                placeholder={t("auth.phonePlaceholder")}
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
              <PrimaryButton disabled={isSubmitting} type="submit">
                {isSubmitting ? t("auth.loggingIn") : t("auth.loginToFindServices")}
              </PrimaryButton>
            </FieldStack>
          </form>

          <p className="mt-6 text-center text-[16px] leading-7 tracking-normal text-[#6d737c]">
            {t("auth.noCustomerAccount")}{" "}
            <AuthLink href="/customer/register">{t("auth.createAccount")}</AuthLink>
          </p>
        </AuthCard>

        <p className="mt-8 text-center text-[16px] leading-7 tracking-normal">
          <AuthLink href="/provider/login">{t("auth.areProvider")}</AuthLink>
        </p>
      </AuthPage>
    </AuthRedirectGuard>
  );
}
