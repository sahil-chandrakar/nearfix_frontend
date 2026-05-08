"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AuthCard,
  AuthPage,
  FieldStack,
  PrimaryButton,
  TextField,
} from "@/components/auth/marketplace-auth";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { loginAdmin } from "@/services/admin-service";
import { getCurrentUser } from "@/services/auth-service";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { isReady, setToken, token } = useAuthToken();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    let isMounted = true;
    getCurrentUser(token)
      .then((user) => {
        if (isMounted && user.role === "admin") {
          router.replace("/admin/dashboard");
        }
      })
      .catch(() => {
        // Login form remains available for expired tokens.
      });

    return () => {
      isMounted = false;
    };
  }, [isReady, router, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const nextToken = await loginAdmin({ password, phone });
      setToken(nextToken.accessToken);
      router.push("/admin/dashboard");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : t("auth.adminLogin"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPage subtitle={t("auth.adminLoginSubtitle")}>
      <AuthCard
        description={t("auth.adminLoginDescription")}
        title={t("auth.adminLogin")}
      >
        {error ? (
          <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-[14px] leading-5 text-red-600">
            {error}
          </p>
        ) : null}
        <form onSubmit={handleSubmit}>
          <FieldStack>
            <TextField
              inputMode="numeric"
              label={t("auth.adminPhoneNumber")}
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
            <PrimaryButton disabled={isSubmitting} type="submit">
              {isSubmitting ? t("auth.loggingIn") : t("auth.loginToAdmin")}
            </PrimaryButton>
          </FieldStack>
        </form>
      </AuthCard>
    </AuthPage>
  );
}
