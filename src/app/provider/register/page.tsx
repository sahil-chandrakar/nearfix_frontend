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
      setError("Location capture is not available in this browser.");
      return;
    }

    setIsCapturingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationStatus("Location captured.");
        setIsCapturingLocation(false);
      },
      () => {
        setError("Unable to capture location. You can still submit without GPS.");
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
      setError("Please upload all required JPG documents.");
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
          : "Unable to submit your shop right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthRedirectGuard>
      <AuthPage subtitle="Service Provider Registration">
        <AuthCard
          description="Fill in the details below to get your shop verified and listed."
          title="Shop Details"
        >
          <form onSubmit={handleSubmit}>
            <FieldStack>
              <TextField
                label="Shop/Company Name"
                minLength={2}
                onChange={(event) => setShopCompanyName(event.target.value)}
                placeholder="e.g., Deshmukh Brothers"
                required
                value={shopCompanyName}
              />
              <TextField
                label="Owner Name"
                minLength={2}
                onChange={(event) => setOwnerName(event.target.value)}
                placeholder="e.g., Tarendra Kumar"
                required
                value={ownerName}
              />
              <TextField
                autoComplete="tel"
                inputMode="numeric"
                label="WhatsApp Mobile No."
                maxLength={10}
                onChange={(event) => setWhatsappMobileNumber(event.target.value)}
                pattern="[0-9]{10}"
                placeholder="10-digit mobile number"
                required
                type="tel"
                value={whatsappMobileNumber}
              />
              <TextField
                autoComplete="email"
                label="Email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="e.g., your.email@example.com"
                required
                type="email"
                value={email}
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
              <FileField
                label="Owner Aadhar Card (Front)"
                onChange={(event) => handleFileChange("aadhaarFront", event)}
                required
              />
              <FileField
                label="Owner Aadhar Card (Back)"
                onChange={(event) => handleFileChange("aadhaarBack", event)}
                required
              />
              <FileField
                label="Shop Payment Bill (e.g., Rent/Lease)"
                onChange={(event) => handleFileChange("paymentBill", event)}
                required
              />
              <FileField
                label="Shop Electricity Bill"
                onChange={(event) => handleFileChange("electricityBill", event)}
                required
              />

              <div>
                <p className="text-[16px] font-medium leading-none tracking-normal text-[#2f3338]">
                  Shop Location (GPS)
                </p>
                <button
                  className="mt-3 flex h-[52px] w-full items-center justify-center gap-3 rounded-lg border border-[#e7ecef] bg-white px-4 text-[16px] font-normal tracking-normal text-[#2f3338] transition hover:border-[#f9a21a] focus:outline-none focus:ring-2 focus:ring-[#fff0d4] disabled:cursor-not-allowed disabled:text-[#9aa0a6]"
                  disabled={isCapturingLocation}
                  onClick={captureLocation}
                  type="button"
                >
                  <LocationIcon />
                  {isCapturingLocation
                    ? "Capturing Location..."
                    : "Capture Current Location"}
                </button>
                <p className="mt-3 text-[13px] leading-5 tracking-normal text-[#7a7f86]">
                  {locationStatus ||
                    "Please be at your shop to capture the correct location."}
                </p>
              </div>

              {error ? (
                <p className="text-[14px] leading-5 text-red-600">{error}</p>
              ) : null}
              <PrimaryButton disabled={isSubmitting} type="submit">
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </PrimaryButton>
            </FieldStack>
          </form>

          <p className="mt-6 text-center text-[16px] leading-7 tracking-normal text-[#6d737c]">
            Already registered?{" "}
            <AuthLink href="/provider/login">Login to Dashboard</AuthLink>
          </p>
        </AuthCard>
      </AuthPage>
    </AuthRedirectGuard>
  );
}
