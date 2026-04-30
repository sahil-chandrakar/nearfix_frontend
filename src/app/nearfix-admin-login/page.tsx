"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AuthCard,
  AuthPage,
  FieldStack,
  PrimaryButton,
  TextField,
} from "@/components/auth/marketplace-auth";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { loginAdmin } from "@/services/admin-service";
import { getCurrentUser } from "@/services/auth-service";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
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
          : "Unable to login as admin.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPage subtitle="NearFix Admin">
      <AuthCard
        description="Use your admin phone number and password to manage approvals, services, banners, and activity."
        title="Admin Login"
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
              label="Admin Phone Number"
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
              placeholder="Enter password"
              required
              type="password"
              value={password}
            />
            <PrimaryButton disabled={isSubmitting} type="submit">
              {isSubmitting ? "Logging in..." : "Login to Admin"}
            </PrimaryButton>
          </FieldStack>
        </form>
      </AuthCard>
    </AuthPage>
  );
}
