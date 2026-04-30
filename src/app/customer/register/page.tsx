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
import { registerCustomer } from "@/services/auth-service";
import { useRouter } from "next/navigation";

export default function CustomerRegisterPage() {
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
          : "Unable to create your account right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthRedirectGuard>
      <AuthPage subtitle="Customer Registration">
        <AuthCard
          description="Create your account to book trusted local services."
          title="Customer Register"
        >
          <form onSubmit={handleSubmit}>
            <FieldStack>
              <TextField
                autoComplete="name"
                label="Name"
                minLength={2}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                required
                value={name}
              />
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
                autoComplete="new-password"
                label="Password"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create your password"
                required
                type="password"
                value={password}
              />
              {error ? (
                <p className="text-[14px] leading-5 text-red-600">{error}</p>
              ) : null}
              <PrimaryButton disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating..." : "Create Account"}
              </PrimaryButton>
            </FieldStack>
          </form>

          <p className="mt-6 text-center text-[16px] leading-7 tracking-normal text-[#6d737c]">
            Already registered?{" "}
            <AuthLink href="/customer/login">Login</AuthLink>
          </p>
        </AuthCard>
      </AuthPage>
    </AuthRedirectGuard>
  );
}
