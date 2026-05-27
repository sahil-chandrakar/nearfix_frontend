"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { AdminButton } from "@/components/admin/admin-shell";

type RejectionReasonModalProps = {
  description: string;
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  reasonLabel?: string;
  submitLabel?: string;
  targetLabel: string;
  title: string;
};

export function RejectionReasonModal({
  description,
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
  reasonLabel = "Rejection reason",
  submitLabel = "Reject",
  targetLabel,
  title,
}: RejectionReasonModalProps) {
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");

  function resetForm() {
    setError("");
    setReason("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      setError("");
      await onSubmit(trimmedReason);
      resetForm();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reject.",
      );
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
      role="dialog"
    >
      <section className="w-full max-w-[460px] rounded-xl border border-[#e7ecef] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-extrabold leading-tight text-black">
              {title}
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[#6d737c]">
              {description}
            </p>
            <p className="mt-2 text-[14px] font-semibold text-[#2f3338]">
              {targetLabel}
            </p>
          </div>
          <button
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[24px] leading-none text-[#4d525a] transition hover:bg-[#f5f7f8] hover:text-black"
            onClick={handleClose}
            type="button"
          >
            x
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-[14px] text-red-600">
            {error}
          </p>
        ) : null}

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <label className="text-[14px] font-semibold text-[#2f3338]">
            {reasonLabel}
            <textarea
              className="mt-2 min-h-28 w-full resize-y rounded-lg border border-[#e7ecef] px-4 py-3 text-[14px] leading-6 text-black outline-none transition placeholder:text-[#9aa0a6] focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain what needs to be fixed."
              value={reason}
            />
          </label>
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AdminButton onClick={handleClose} tone="secondary">
              Cancel
            </AdminButton>
            <AdminButton disabled={isSubmitting} tone="danger" type="submit">
              {isSubmitting ? "Rejecting..." : submitLabel}
            </AdminButton>
          </div>
        </form>
      </section>
    </div>
  );
}
