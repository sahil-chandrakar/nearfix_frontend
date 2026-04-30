"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  AdminShell,
  AdminStatusBadge,
  formatAdminDate,
} from "@/components/admin/admin-shell";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import {
  fetchAdminBlobUrl,
  getAdminProvider,
  updateAdminUserActive,
  updateAdminProviderStatus,
} from "@/services/admin-service";
import type { AdminProvider } from "@/types/admin";

const documents = [
  ["aadhaar_front", "Aadhaar Front"],
  ["aadhaar_back", "Aadhaar Back"],
  ["payment_bill", "Payment/Rent Bill"],
  ["electricity_bill", "Electricity Bill"],
] as const;

export default function AdminProviderDetailPage() {
  const params = useParams<{ id: string }>();
  const providerId = Number(params.id);
  const { token } = useAuthToken();
  const [provider, setProvider] = useState<AdminProvider | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !providerId) {
      return;
    }

    getAdminProvider(token, providerId)
      .then((nextProvider) => {
        setProvider(nextProvider);
        setError("");
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Unable to load provider.",
        );
      });
  }, [providerId, token]);

  async function reviewProvider(verificationStatus: "approved" | "rejected") {
    if (!token || !provider) {
      return;
    }

    const reason =
      verificationStatus === "rejected"
        ? window.prompt("Enter rejection reason for provider:")
        : undefined;
    if (verificationStatus === "rejected" && !reason?.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      const updated = await updateAdminProviderStatus(token, provider.id, {
        reason: reason?.trim(),
        verificationStatus,
      });
      setProvider(updated);
      setMessage(
        verificationStatus === "approved"
          ? "Provider approved."
          : "Provider rejected.",
      );
      setError("");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update provider.",
      );
    }
  }

  async function toggleProviderActive() {
    if (!token || !provider) {
      return;
    }
    try {
      await updateAdminUserActive(token, provider.userId, !provider.userIsActive);
      setProvider({ ...provider, userIsActive: !provider.userIsActive });
      setMessage(provider.userIsActive ? "Provider suspended." : "Provider restored.");
      setError("");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update provider account.",
      );
    }
  }

  async function openDocument(documentType: string) {
    if (!token || !provider) {
      return;
    }
    try {
      const objectUrl = await fetchAdminBlobUrl(
        token,
        `/admin/providers/${provider.id}/documents/${documentType}`,
      );
      window.open(objectUrl, "_blank", "noopener,noreferrer");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to open document.",
      );
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        action={
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#e7ecef] px-4 text-[14px] font-semibold text-[#2f3338] transition hover:border-[#f9a21a]"
            href="/admin/providers"
          >
            Back
          </Link>
        }
        subtitle="Inspect shop details, selected categories, documents, and approval status."
        title="Provider Detail"
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-lg bg-[#defde7] px-4 py-3 text-[14px] text-[#2aa946]">
          {message}
        </p>
      ) : null}

      {!provider ? (
        <AdminCard>Loading provider...</AdminCard>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
          <AdminCard>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[24px] font-extrabold text-black">
                {provider.shopCompanyName}
              </h2>
              <AdminStatusBadge status={provider.verificationStatus} />
              <AdminStatusBadge status={provider.userIsActive ? "active" : "blocked"} />
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Owner", provider.ownerName],
                ["Phone", provider.whatsappMobileNumber],
                ["Email", provider.email],
                ["Registered", formatAdminDate(provider.createdAt)],
                ["Latitude", provider.latitude ?? "Unavailable"],
                ["Longitude", provider.longitude ?? "Unavailable"],
              ].map(([label, value]) => (
                <div className="rounded-lg bg-[#f5fbfd] p-4" key={label as string}>
                  <dt className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7f86]">
                    {label}
                  </dt>
                  <dd className="mt-2 break-words text-[15px] font-semibold text-[#2f3338]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            {provider.rejectionReason ? (
              <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-[14px] text-red-600">
                Rejection reason: {provider.rejectionReason}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <AdminButton
                disabled={provider.verificationStatus === "approved"}
                onClick={() => reviewProvider("approved")}
              >
                Approve Provider
              </AdminButton>
              <AdminButton
                disabled={provider.verificationStatus === "rejected"}
                onClick={() => reviewProvider("rejected")}
                tone="danger"
              >
                Reject Provider
              </AdminButton>
              <AdminButton
                onClick={toggleProviderActive}
                tone={provider.userIsActive ? "danger" : "secondary"}
              >
                {provider.userIsActive ? "Suspend Account" : "Restore Account"}
              </AdminButton>
            </div>
          </AdminCard>

          <div className="grid gap-5">
            <AdminCard>
              <h2 className="text-[20px] font-extrabold text-black">Categories</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {provider.categorySlugs.length === 0 ? (
                  <p className="text-[14px] text-[#7a7f86]">No categories selected.</p>
                ) : (
                  provider.categorySlugs.map((slug) => (
                    <span
                      className="rounded-full bg-[#fff4df] px-3 py-1 text-[12px] font-semibold text-[#d88708]"
                      key={slug}
                    >
                      {slug}
                    </span>
                  ))
                )}
              </div>
            </AdminCard>

            <AdminCard>
              <h2 className="text-[20px] font-extrabold text-black">Documents</h2>
              <div className="mt-4 grid gap-3">
                {documents.map(([documentType, label]) => (
                  <button
                    className="flex min-h-12 items-center justify-between rounded-lg border border-[#e7ecef] px-4 text-left text-[14px] font-semibold text-[#2f3338] transition hover:border-[#f9a21a]"
                    key={documentType}
                    onClick={() => openDocument(documentType)}
                    type="button"
                  >
                    <span>{label}</span>
                    <span className="text-[#d88708]">Open</span>
                  </button>
                ))}
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
