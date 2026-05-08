"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { AuthRedirectGuard } from "@/components/auth/auth-redirect-guard";
import {
  AuthCard,
  AuthLink,
  AuthPage,
  FieldStack,
  FileField,
  PrimaryButton,
  TextField,
} from "@/components/auth/marketplace-auth";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { registerProvider } from "@/services/auth-service";
import { useRouter } from "next/navigation";

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function ProviderRegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { clearToken } = useAuthToken();
  const [shopCompanyName, setShopCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [whatsappMobileNumber, setWhatsappMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [files, setFiles] = useState<Record<string, File | null>>({
    aadhaarFront: null,
    aadhaarBack: null,
    paymentBill: null,
    electricityBill: null,
  });
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  function handleFileChange(key: string, event: ChangeEvent<HTMLInputElement>) {
    setFiles((currentFiles) => ({
      ...currentFiles,
      [key]: event.target.files?.[0] ?? null,
    }));
  }

  function captureLocation() {
    setError("");
    setLocationStatus("");

    if (!navigator.geolocation) {
      setError(t("provider.locationUnavailable"));
      return;
    }

    setIsCapturingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationStatus(t("provider.locationCaptured"));
        setIsCapturingLocation(false);
      },
      () => {
        setError(t("provider.locationCaptureFailed"));
        setIsCapturingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const requiredFileKeys = [
      "aadhaarFront",
      "aadhaarBack",
      "paymentBill",
      "electricityBill",
    ];
    const missingFile = requiredFileKeys.some((key) => files[key] === null);
    if (missingFile) {
      setError(t("provider.uploadAllDocs"));
      return;
    }

    const formData = new FormData();
    formData.append("shopCompanyName", shopCompanyName);
    formData.append("ownerName", ownerName);
    formData.append("whatsappMobileNumber", whatsappMobileNumber);
    formData.append("email", email);
    formData.append("password", password);

    if (latitude !== null && longitude !== null) {
      formData.append("latitude", String(latitude));
      formData.append("longitude", String(longitude));
    }

    for (const key of requiredFileKeys) {
      const file = files[key];
      if (file) {
        formData.append(key, file);
      }
    }

    setIsSubmitting(true);
    try {
      await registerProvider(formData);
      clearToken();
      router.push("/provider/login");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : t("provider.submitForVerification"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthRedirectGuard>
      <AuthPage subtitle={t("auth.providerRegistration")}>
        <AuthCard
          description={t("auth.providerRegisterDescription")}
          title={t("provider.shopDetails")}
        >
          <form onSubmit={handleSubmit}>
            <FieldStack>
              <TextField
                label={t("provider.shopName")}
                minLength={2}
                onChange={(event) => setShopCompanyName(event.target.value)}
                placeholder="e.g., Deshmukh Brothers"
                required
                value={shopCompanyName}
              />
              <TextField
                label={t("provider.ownerName")}
                minLength={2}
                onChange={(event) => setOwnerName(event.target.value)}
                placeholder="e.g., Tarendra Kumar"
                required
                value={ownerName}
              />
              <TextField
                autoComplete="tel"
                inputMode="numeric"
                label={t("provider.whatsappNumber")}
                maxLength={10}
                onChange={(event) => setWhatsappMobileNumber(event.target.value)}
                pattern="[0-9]{10}"
                placeholder={t("auth.phonePlaceholder")}
                required
                type="tel"
                value={whatsappMobileNumber}
              />
              <TextField
                autoComplete="email"
                label={t("common.email")}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="e.g., your.email@example.com"
                required
                type="email"
                value={email}
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
              <FileField
                label={t("provider.aadhaarFront")}
                onChange={(event) => handleFileChange("aadhaarFront", event)}
                required
              />
              <FileField
                label={t("provider.aadhaarBack")}
                onChange={(event) => handleFileChange("aadhaarBack", event)}
                required
              />
              <FileField
                label={t("provider.paymentBill")}
                onChange={(event) => handleFileChange("paymentBill", event)}
                required
              />
              <FileField
                label={t("provider.electricityBill")}
                onChange={(event) => handleFileChange("electricityBill", event)}
                required
              />

              <div>
                <p className="text-[16px] font-medium leading-none tracking-normal text-[#2f3338]">
                  {t("provider.shopLocation")}
                </p>
                <button
                  className="mt-3 flex h-[52px] w-full items-center justify-center gap-3 rounded-lg border border-[#e7ecef] bg-white px-4 text-[16px] font-normal tracking-normal text-[#2f3338] transition hover:border-[#f9a21a] focus:outline-none focus:ring-2 focus:ring-[#fff0d4] disabled:cursor-not-allowed disabled:text-[#9aa0a6]"
                  disabled={isCapturingLocation}
                  onClick={captureLocation}
                  type="button"
                >
                  <LocationIcon />
                  {isCapturingLocation
                    ? t("provider.capturingLocation")
                    : t("provider.captureLocation")}
                </button>
                <p className="mt-3 text-[13px] leading-5 tracking-normal text-[#7a7f86]">
                  {locationStatus ||
                    t("provider.locationHint")}
                </p>
              </div>

              {error ? (
                <p className="text-[14px] leading-5 text-red-600">{error}</p>
              ) : null}
              <PrimaryButton disabled={isSubmitting} type="submit">
                {isSubmitting ? t("provider.submitting") : t("provider.submitForVerification")}
              </PrimaryButton>
            </FieldStack>
          </form>

          <p className="mt-6 text-center text-[16px] leading-7 tracking-normal text-[#6d737c]">
            {t("auth.alreadyRegistered")}{" "}
            <AuthLink href="/provider/login">{t("auth.loginToDashboard")}</AuthLink>
          </p>
        </AuthCard>
      </AuthPage>
    </AuthRedirectGuard>
  );
}
