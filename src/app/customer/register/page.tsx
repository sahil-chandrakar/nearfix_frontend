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
import { registerCustomer } from "@/services/auth-service";
import { useRouter } from "next/navigation";

export default function CustomerRegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { clearToken } = useAuthToken();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await registerCustomer({ name, phone, password });
      clearToken();
      router.push("/customer/login");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : t("auth.createAccount"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthRedirectGuard>
      <AuthPage subtitle={t("auth.customerRegistration")}>
        <AuthCard
          description={t("auth.customerRegisterDescription")}
          title={t("auth.customerRegister")}
        >
          <form onSubmit={handleSubmit}>
            <FieldStack>
              <TextField
                autoComplete="name"
                label={t("common.name")}
                minLength={2}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("auth.enterFullName")}
                required
                value={name}
              />
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
                autoComplete="new-password"
                label={t("common.password")}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("auth.createPassword")}
                required
                type="password"
                value={password}
              />
              {error ? (
                <p className="text-[14px] leading-5 text-red-600">{error}</p>
              ) : null}
              <PrimaryButton disabled={isSubmitting} type="submit">
                {isSubmitting ? t("auth.creating") : t("auth.createAccount")}
              </PrimaryButton>
            </FieldStack>
          </form>

          <p className="mt-6 text-center text-[16px] leading-7 tracking-normal text-[#6d737c]">
            {t("auth.alreadyRegistered")}{" "}
            <AuthLink href="/customer/login">{t("common.login")}</AuthLink>
          </p>
        </AuthCard>
      </AuthPage>
    </AuthRedirectGuard>
  );
}
