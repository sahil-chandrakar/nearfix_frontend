"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { CustomerShell } from "@/components/customer/customer-shell";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import {
  getCurrentUser,
  logoutUser,
  updateCustomerProfile,
} from "@/services/auth-service";
import type { User } from "@/types/auth";
import { useRouter } from "next/navigation";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { language, t } = useI18n();
  const { clearToken, isReady, token } = useAuthToken();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!token) {
      router.replace("/customer/login");
      return;
    }

    let isMounted = true;

    getCurrentUser(token)
      .then((nextUser) => {
        if (isMounted) {
          setUser(nextUser);
          setName(nextUser.fullName ?? "");
          setPhone(nextUser.phone ?? "");
          setError("");
        }
      })
      .catch((caughtError) => {
        if (isMounted) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Unable to load profile.",
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

  function handleLogout() {
    if (token) {
      void logoutUser(token).catch(() => undefined);
    }

    clearToken();
    router.push("/");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      router.replace("/customer/login");
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const updatedUser = await updateCustomerProfile(token, { name, phone });
      setUser(updatedUser);
      setName(updatedUser.fullName ?? "");
      setPhone(updatedUser.phone ?? "");
      setMessage(language === "hi" ? "प्रोफाइल अपडेट हो गई।" : "Profile updated.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <CustomerShell>
      <div className="mx-auto w-full max-w-[492px] px-6 pb-10 pt-8 sm:max-w-[536px] sm:px-8 md:max-w-[880px] md:px-10">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-normal text-black sm:text-[30px] md:text-[35px]">
          {t("customer.profileTitle")}
        </h1>

        <section className="mt-7 rounded-xl border border-[#e7ecef] bg-white px-5 py-7 shadow-[0_2px_10px_rgba(15,23,42,0.07)] sm:px-6 sm:py-8">
          {isLoading ? (
            <p className="text-[17px] leading-7 text-[#6d737c]">
              {t("common.loading")}
            </p>
          ) : null}

          {error && !user ? (
            <p className="text-[17px] leading-7 text-red-600">{error}</p>
          ) : null}

          {user ? (
            <form onSubmit={handleSave}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff4df] text-[#ee9f19] sm:h-24 sm:w-24">
                <svg
                  aria-hidden="true"
                  className="h-10 w-10 sm:h-12 sm:w-12"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.1"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="8" r="3" />
                  <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
                </svg>
              </div>

              <div className="mt-7 flex flex-col gap-5">
                <label className="block text-[15px] font-semibold leading-none tracking-normal text-[#2f3338]">
                  {t("common.name")}
                  <input
                    className="mt-3 h-[50px] w-full rounded-lg border border-[#e7ecef] bg-white px-4 text-[16px] tracking-normal text-black outline-none transition placeholder:text-[#9aa0a6] focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
                    minLength={2}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t("common.name")}
                    required
                    value={name}
                  />
                </label>

                <label className="block text-[15px] font-semibold leading-none tracking-normal text-[#2f3338]">
                  {t("common.mobileNumber")}
                  <input
                    className="mt-3 h-[50px] w-full rounded-lg border border-[#e7ecef] bg-white px-4 text-[16px] tracking-normal text-black outline-none transition placeholder:text-[#9aa0a6] focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(event) => setPhone(event.target.value)}
                    pattern="[0-9]{10}"
                    placeholder={t("auth.phonePlaceholder")}
                    required
                    type="tel"
                    value={phone}
                  />
                </label>
              </div>

              {message ? (
                <p className="mt-5 text-[14px] leading-5 text-[#2aa946]">
                  {message}
                </p>
              ) : null}

              {error ? (
                <p className="mt-5 text-[14px] leading-5 text-red-600">
                  {error}
                </p>
              ) : null}

              <button
                className="mt-7 h-[50px] w-full rounded-lg bg-[#f9a21a] px-5 text-[16px] font-semibold tracking-normal text-white transition hover:bg-[#ee9914] disabled:cursor-not-allowed disabled:bg-[#f7c982] sm:h-[52px] sm:text-[17px]"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? t("common.loading") : t("customer.updateProfile")}
              </button>

              <button
                className="mt-4 h-[50px] w-full rounded-lg border border-[#f9a21a] bg-white px-5 text-[16px] font-semibold tracking-normal text-[#d88708] transition hover:bg-[#fff4df] sm:h-[52px] sm:text-[17px]"
                onClick={handleLogout}
                type="button"
              >
                {t("common.logout")}
              </button>
            </form>
          ) : null}
        </section>
      </div>
    </CustomerShell>
  );
}
