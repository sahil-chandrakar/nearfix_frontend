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
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { loginCustomer } from "@/services/auth-service";
import { useRouter } from "next/navigation";

export default function CustomerLoginPage() {
  const router = useRouter();
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
      <AuthPage subtitle="Customer Portal">
        <AuthCard
          description="Enter your mobile number and password to find local services."
          title="Customer Login"
        >
          <form onSubmit={handleSubmit}>
            <FieldStack>
              <TextField
                autoComplete="tel"
                inputMode="numeric"
                label="Mobile Number"
                maxLength={10}
                onChange={(event) => setPhone(event.target.value)}
                pattern="[0-9]{10}"
                placeholder="10-digit mobile number"
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
              <PrimaryButton disabled={isSubmitting} type="submit">
                {isSubmitting ? "Logging in..." : "Login to Find Services"}
              </PrimaryButton>
            </FieldStack>
          </form>

          <p className="mt-6 text-center text-[16px] leading-7 tracking-normal text-[#6d737c]">
            Don&apos;t have a customer account?{" "}
            <AuthLink href="/customer/register">Create Account</AuthLink>
          </p>
        </AuthCard>

        <p className="mt-8 text-center text-[16px] leading-7 tracking-normal">
          <AuthLink href="/provider/login">Are you a service provider?</AuthLink>
        </p>
      </AuthPage>
    </AuthRedirectGuard>
  );
}
