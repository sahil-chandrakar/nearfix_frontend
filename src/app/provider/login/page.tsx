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
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { getProviderCategories, loginProvider } from "@/services/auth-service";
import { useRouter } from "next/navigation";

export default function ProviderLoginPage() {
  const router = useRouter();
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
      const categories = await getProviderCategories(token.accessToken);
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
      <AuthPage subtitle="Service Provider Portal">
        <AuthCard
          description="Enter your registered mobile number and password to continue."
          title="Provider Login"
        >
          <form onSubmit={handleSubmit}>
            <FieldStack>
              <TextField
                autoComplete="tel"
                inputMode="numeric"
                label="Registered Mobile Number"
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
                label="Password"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
              {error ? (
                <p className="text-[14px] leading-5 text-red-600">{error}</p>
              ) : null}
              <PrimaryButton
                disabled={isSubmitting}
                onClick={handleButtonClick}
                type="button"
              >
                {isSubmitting ? "Logging in..." : "Login to Dashboard"}
              </PrimaryButton>
            </FieldStack>
          </form>

          <p className="mt-6 text-center text-[16px] leading-7 tracking-normal text-[#6d737c]">
            Don&apos;t have a provider account?{" "}
            <AuthLink href="/provider/register">Register Your Shop</AuthLink>
          </p>
        </AuthCard>

        <p className="mt-8 text-center text-[16px] leading-7 tracking-normal">
          <AuthLink href="/customer/login">Are you a customer?</AuthLink>
        </p>
      </AuthPage>
    </AuthRedirectGuard>
  );
}
