"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  FieldStack,
  FileField,
  PrimaryButton,
  TextField,
} from "@/components/auth/marketplace-auth";
import { ServiceIcon } from "@/components/customer/service-icon";
import {
  ProviderCard,
  ProviderPageFrame,
} from "@/components/provider/provider-shell";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import type { TranslationKey } from "@/lib/i18n";
import { ApiError } from "@/lib/http-client";
import { categoryGroupLabel, categoryLabel } from "@/lib/localized-labels";
import { categoryGroups, serviceCategories } from "@/lib/service-categories";
import {
  createProviderDocumentChangeRequests,
  getCategories,
  getProviderCategories,
  getProviderDocumentChangeRequests,
  getProviderProfile,
  saveProviderCategories,
  updateProviderPassword,
  updateProviderProfile,
} from "@/services/auth-service";
import type {
  ApiServiceCategory,
  ProviderDocumentChangeRequest,
  ProviderProfile,
} from "@/types/auth";
import { useRouter } from "next/navigation";

const documentLabelKeys: Record<
  ProviderDocumentChangeRequest["documentType"],
  TranslationKey
> = {
  aadhaar_back: "provider.aadhaarBack",
  aadhaar_front: "provider.aadhaarFront",
  electricity_bill: "provider.electricityBill",
  payment_bill: "provider.paymentBill",
};

function StatusBadge({ status }: { status: ProviderDocumentChangeRequest["status"] }) {
  const { t } = useI18n();
  const className =
    status === "approved"
      ? "bg-[#defde7] text-[#2aa946]"
      : status === "rejected"
        ? "bg-red-50 text-red-600"
        : "bg-[#fff4df] text-[#d88708]";

  return (
    <span className={`rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${className}`}>
      {t(`status.${status}` as TranslationKey)}
    </span>
  );
}

export default function ProviderMyShopPage() {
  const { language, t } = useI18n();
  const router = useRouter();
  const { isReady, token } = useAuthToken();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] =
    useState<ApiServiceCategory[]>([]);
  const [documentRequests, setDocumentRequests] = useState<
    ProviderDocumentChangeRequest[]
  >([]);
  const [shopCompanyName, setShopCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [whatsappMobileNumber, setWhatsappMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [files, setFiles] = useState<Record<string, File | null>>({
    aadhaarFront: null,
    aadhaarBack: null,
    paymentBill: null,
    electricityBill: null,
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!token) {
      router.replace("/provider/login");
      return;
    }

    let isMounted = true;

    Promise.all([
      getProviderProfile(token),
      getProviderCategories(token),
      getProviderDocumentChangeRequests(token),
      getCategories(),
    ])
      .then(([nextProfile, categories, requests, apiCategories]) => {
        if (!isMounted) {
          return;
        }

        setProfile(nextProfile);
        setShopCompanyName(nextProfile.shopCompanyName);
        setOwnerName(nextProfile.ownerName);
        setWhatsappMobileNumber(nextProfile.whatsappMobileNumber);
        setEmail(nextProfile.email);
        setLatitude(nextProfile.latitude);
        setLongitude(nextProfile.longitude);
        setSelectedSlugs(categories.categorySlugs);
        setDocumentRequests(requests);
        setAvailableCategories(apiCategories);
        setError("");
      })
      .catch((caughtError) => {
        if (isMounted) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : t("provider.shopDetails"),
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
  }, [isReady, router, t, token]);

  function toggleCategory(slug: string) {
    setSelectedSlugs((currentSlugs) =>
      currentSlugs.includes(slug)
        ? currentSlugs.filter((currentSlug) => currentSlug !== slug)
        : [...currentSlugs, slug],
    );
  }

  function captureLocation() {
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setError(t("provider.locationUnavailable"));
      return;
    }

    setIsCapturingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setMessage(t("provider.locationCaptured"));
        setIsCapturingLocation(false);
      },
      () => {
        setError(t("provider.locationCaptureFailed"));
        setIsCapturingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      router.replace("/provider/login");
      return;
    }

    setError("");
    setMessage("");
    setIsSavingDetails(true);

    try {
      const updatedProfile = await updateProviderProfile(token, {
        email,
        latitude,
        longitude,
        ownerName,
        shopCompanyName,
        whatsappMobileNumber,
      });
      setProfile(updatedProfile);
      setMessage(t("provider.shopDetailsUpdated"));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : t("provider.shopDetails"),
      );
    } finally {
      setIsSavingDetails(false);
    }
  }

  async function handleCategoriesSubmit() {
    if (!token) {
      router.replace("/provider/login");
      return;
    }

    setError("");
    setMessage("");
    setIsSavingCategories(true);

    try {
      const categories = await saveProviderCategories(token, selectedSlugs);
      setSelectedSlugs(categories.categorySlugs);
      setMessage(t("provider.categoriesUpdated"));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : t("provider.saveCategories"),
      );
    } finally {
      setIsSavingCategories(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      router.replace("/provider/login");
      return;
    }

    setError("");
    setMessage("");
    setIsSavingPassword(true);

    try {
      await updateProviderPassword(token, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setMessage(t("provider.passwordChanged"));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : t("provider.changePassword"),
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  function handleFileChange(key: string, event: ChangeEvent<HTMLInputElement>) {
    setFiles((currentFiles) => ({
      ...currentFiles,
      [key]: event.target.files?.[0] ?? null,
    }));
  }

  async function handleDocumentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      router.replace("/provider/login");
      return;
    }

    const selectedFiles = Object.entries(files).filter(([, file]) => file !== null);
    if (selectedFiles.length === 0) {
      setError(t("provider.chooseOneDocument"));
      return;
    }

    const formData = new FormData();
    for (const [key, file] of selectedFiles) {
      if (file) {
        formData.append(key, file);
      }
    }

    setError("");
    setMessage("");
    setIsUploadingDocuments(true);

    try {
      const requests = await createProviderDocumentChangeRequests(token, formData);
      setDocumentRequests((currentRequests) => [...requests, ...currentRequests]);
      setFiles({
        aadhaarBack: null,
        aadhaarFront: null,
        electricityBill: null,
        paymentBill: null,
      });
      setMessage(t("provider.documentRequestSubmitted"));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : t("provider.documents"),
      );
    } finally {
      setIsUploadingDocuments(false);
    }
  }

  return (
    <ProviderPageFrame title={t("provider.myShop")}>
      {isLoading ? (
        <ProviderCard>
          <p className="text-[16px] leading-7 text-[#6d737c]">
            {t("common.loading")}
          </p>
        </ProviderCard>
      ) : null}

      {error ? (
        <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-[14px] leading-5 text-red-600">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mb-5 rounded-lg bg-[#defde7] px-4 py-3 text-[14px] leading-5 text-[#2aa946]">
          {message}
        </p>
      ) : null}

      {profile ? (
        <div className="flex flex-col gap-5 sm:gap-6">
          <ProviderCard>
            <h2 className="text-[22px] font-extrabold tracking-normal text-black sm:text-[24px]">
              {t("provider.shopDetails")}
            </h2>
            {profile.rejectionReason ? (
              <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-[14px] leading-5 text-red-600">
                {t("provider.rejectionReason")}: {profile.rejectionReason}
              </p>
            ) : null}
            <p className="mt-2 text-[14px] leading-6 tracking-normal text-[#7a7f86] sm:text-[15px]">
              {t("provider.immediateFields")}
            </p>
            <form className="mt-5 sm:mt-6" onSubmit={handleDetailsSubmit}>
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
                  placeholder="Owner name"
                  required
                  value={ownerName}
                />
                <TextField
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
                  label={t("common.email")}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="email@example.com"
                  required
                  type="email"
                  value={email}
                />
                <div>
                  <p className="text-[16px] font-medium leading-none tracking-normal text-[#2f3338]">
                    {t("provider.shopLocation")}
                  </p>
                  <button
                    className="mt-3 flex h-[52px] w-full items-center justify-center rounded-lg border border-[#e7ecef] bg-white px-4 text-[16px] font-normal tracking-normal text-[#2f3338] transition hover:border-[#f9a21a]"
                    disabled={isCapturingLocation}
                    onClick={captureLocation}
                    type="button"
                  >
                    {isCapturingLocation
                      ? t("provider.capturingLocation")
                      : t("provider.captureLocation")}
                  </button>
                  <p className="mt-3 text-[13px] leading-5 tracking-normal text-[#7a7f86]">
                    {latitude !== null && longitude !== null
                      ? `${t("provider.currentLocation")}: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                      : t("provider.noLocationSaved")}
                  </p>
                </div>
                <PrimaryButton disabled={isSavingDetails} type="submit">
                  {isSavingDetails ? t("common.saving") : t("provider.saveShopDetails")}
                </PrimaryButton>
              </FieldStack>
            </form>
          </ProviderCard>

          <ProviderCard>
            <h2 className="text-[22px] font-extrabold tracking-normal text-black sm:text-[24px]">
              {t("provider.serviceCategories")}
            </h2>
            <p className="mt-2 text-[14px] leading-6 tracking-normal text-[#7a7f86] sm:text-[15px]">
              {t("provider.categoriesHelp")}
            </p>
            <div className="mt-5 space-y-6 sm:mt-6 sm:space-y-7">
              {categoryGroups.map((group) => (
                <section key={group}>
                  <h3 className="text-[17px] font-extrabold tracking-normal text-black sm:text-[18px]">
                    {categoryGroupLabel(group, language)}
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {(availableCategories.length > 0
                      ? availableCategories
                      : serviceCategories
                    )
                      .filter((category) => category.group === group)
                      .map((category) => {
                        const isSelected = selectedSlugs.includes(category.slug);

                        return (
                          <button
                            className={`flex min-h-[88px] flex-col items-center justify-center rounded-xl border px-3 py-3 text-center transition sm:min-h-[96px] sm:py-4 ${
                              isSelected
                                ? "border-[#f9a21a] bg-[#fff8ec]"
                                : "border-[#e7ecef] bg-white"
                            }`}
                            key={category.slug}
                            onClick={() => toggleCategory(category.slug)}
                            type="button"
                          >
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff4df] text-[#f9a21a] sm:h-12 sm:w-12">
                              <ServiceIcon className="h-6 w-6 sm:h-7 sm:w-7" slug={category.slug} />
                            </span>
                            <span className="mt-2 text-[12px] font-semibold leading-5 tracking-normal text-[#2f3338] sm:mt-3 sm:text-[13px]">
                              {categoryLabel(category, language)}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </section>
              ))}
            </div>
            <button
              className="mt-6 h-[48px] w-full rounded-lg bg-[#f9a21a] px-5 text-[16px] font-semibold tracking-normal text-white transition hover:bg-[#ee9914] disabled:cursor-not-allowed disabled:bg-[#f7c982] sm:mt-7 sm:h-[52px] sm:text-[17px]"
              disabled={isSavingCategories}
              onClick={handleCategoriesSubmit}
              type="button"
            >
              {isSavingCategories ? t("common.saving") : t("provider.saveCategories")}
            </button>
          </ProviderCard>

          <ProviderCard>
            <h2 className="text-[22px] font-extrabold tracking-normal text-black sm:text-[24px]">
              {t("provider.changePassword")}
            </h2>
            <form className="mt-5 sm:mt-6" onSubmit={handlePasswordSubmit}>
              <FieldStack>
                <TextField
                  autoComplete="current-password"
                  label={t("provider.currentPassword")}
                  minLength={8}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder={t("provider.currentPassword")}
                  required
                  type="password"
                  value={currentPassword}
                />
                <TextField
                  autoComplete="new-password"
                  label={t("provider.newPassword")}
                  minLength={8}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={t("provider.newPassword")}
                  required
                  type="password"
                  value={newPassword}
                />
                <PrimaryButton disabled={isSavingPassword} type="submit">
                  {isSavingPassword ? t("provider.changing") : t("provider.changePassword")}
                </PrimaryButton>
              </FieldStack>
            </form>
          </ProviderCard>

          <ProviderCard>
            <h2 className="text-[22px] font-extrabold tracking-normal text-black sm:text-[24px]">
              {t("provider.documents")}
            </h2>
            <p className="mt-2 text-[14px] leading-6 tracking-normal text-[#7a7f86] sm:text-[15px]">
              {t("provider.documentsHelp")}
            </p>
            <form className="mt-5 sm:mt-6" onSubmit={handleDocumentSubmit}>
              <FieldStack>
                <FileField
                  label={t("provider.aadhaarFront")}
                  onChange={(event) => handleFileChange("aadhaarFront", event)}
                />
                <FileField
                  label={t("provider.aadhaarBack")}
                  onChange={(event) => handleFileChange("aadhaarBack", event)}
                />
                <FileField
                  label={t("provider.paymentBill")}
                  onChange={(event) => handleFileChange("paymentBill", event)}
                />
                <FileField
                  label={t("provider.electricityBill")}
                  onChange={(event) => handleFileChange("electricityBill", event)}
                />
                <PrimaryButton disabled={isUploadingDocuments} type="submit">
                  {isUploadingDocuments
                    ? t("provider.submitting")
                    : t("provider.submitDocumentChanges")}
                </PrimaryButton>
              </FieldStack>
            </form>

            {documentRequests.length > 0 ? (
              <div className="mt-7 flex flex-col gap-3">
                {documentRequests.map((request) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#e7ecef] px-4 py-3"
                    key={request.id}
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-[#2f3338]">
                        {t(documentLabelKeys[request.documentType])}
                      </p>
                      <p className="mt-1 text-[12px] text-[#7a7f86]">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      {request.rejectionReason ? (
                        <p className="mt-2 text-[12px] leading-5 text-red-600">
                          {request.rejectionReason}
                        </p>
                      ) : null}
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                ))}
              </div>
            ) : null}
          </ProviderCard>
        </div>
      ) : null}
    </ProviderPageFrame>
  );
}
