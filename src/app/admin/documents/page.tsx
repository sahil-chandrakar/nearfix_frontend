"use client";

import { useEffect, useState } from "react";
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
  getAdminDocuments,
  reviewAdminDocument,
} from "@/services/admin-service";
import type { AdminDocumentRequest } from "@/types/admin";

const documentLabels: Record<AdminDocumentRequest["documentType"], string> = {
  aadhaar_back: "Aadhaar Back",
  aadhaar_front: "Aadhaar Front",
  electricity_bill: "Electricity Bill",
  payment_bill: "Payment Bill",
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminDocumentsPage() {
  const { token } = useAuthToken();
  const [documents, setDocuments] = useState<AdminDocumentRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  function loadDocuments() {
    if (!token) {
      return;
    }
    setIsLoading(true);
    getAdminDocuments(token, statusFilter)
      .then((nextDocuments) => {
        setDocuments(nextDocuments);
        setError("");
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Unable to load document requests.",
        );
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(loadDocuments, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter]);

  async function openRequestFile(requestId: number) {
    if (!token) {
      return;
    }
    try {
      const objectUrl = await fetchAdminBlobUrl(
        token,
        `/admin/provider-document-change-requests/${requestId}/file`,
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

  async function reviewRequest(
    request: AdminDocumentRequest,
    status: "approved" | "rejected",
  ) {
    if (!token) {
      return;
    }
    const reason =
      status === "rejected"
        ? window.prompt("Enter rejection reason for this document:")
        : undefined;
    if (status === "rejected" && !reason?.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    try {
      const updated = await reviewAdminDocument(token, request.id, {
        reason: reason?.trim(),
        status,
      });
      setDocuments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setMessage(status === "approved" ? "Document approved." : "Document rejected.");
      setError("");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to review document.",
      );
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle="Approve or reject provider replacement documents."
        title="Document Requests"
      />

      <AdminCard className="mb-5">
        <label className="text-[14px] font-semibold text-[#2f3338]">
          Status
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] sm:w-[220px]"
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            value={statusFilter}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </label>
      </AdminCard>

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

      <div className="grid gap-4">
        {isLoading ? (
          <AdminCard>Loading documents...</AdminCard>
        ) : documents.length === 0 ? (
          <AdminCard>No document requests found.</AdminCard>
        ) : (
          documents.map((request) => (
            <AdminCard key={request.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[19px] font-extrabold text-black">
                      {documentLabels[request.documentType]}
                    </h2>
                    <AdminStatusBadge status={request.status} />
                  </div>
                  <p className="mt-2 text-[14px] text-[#6d737c]">
                    Provider #{request.providerProfileId} • Submitted{" "}
                    {formatAdminDate(request.createdAt)}
                  </p>
                  {request.rejectionReason ? (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
                      Rejection: {request.rejectionReason}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton
                    onClick={() => openRequestFile(request.id)}
                    tone="secondary"
                  >
                    Open File
                  </AdminButton>
                  <AdminButton
                    disabled={request.status !== "pending"}
                    onClick={() => reviewRequest(request, "approved")}
                  >
                    Approve
                  </AdminButton>
                  <AdminButton
                    disabled={request.status !== "pending"}
                    onClick={() => reviewRequest(request, "rejected")}
                    tone="danger"
                  >
                    Reject
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          ))
        )}
      </div>
    </AdminShell>
  );
}
