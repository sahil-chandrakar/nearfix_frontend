"use client";

import { FormEvent, useState } from "react";
import { AdminButton } from "@/components/admin/admin-shell";
import { useI18n } from "@/components/i18n/language-provider";

type ResetPasswordModalProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<void>;
  targetLabel: string;
};

function PasswordVisibilityIcon({ isVisible }: { isVisible: boolean }) {
  if (isVisible) {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M10.7 5.1A10.9 10.9 0 0 1 12 5c5 0 9 5 9 7a10.6 10.6 0 0 1-2 3" />
        <path d="M6.6 6.6C4.4 8 3 10.5 3 12c0 2 4 7 9 7a9.8 9.8 0 0 0 4.1-.9" />
        <path d="M14.1 14.1A3 3 0 0 1 9.9 9.9" />
        <path d="m3 3 18 18" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PasswordField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const inputType = isVisible ? "text" : "password";

  return (
    <label className="block text-[14px] font-semibold text-[#2f3338]">
      {label}
      <span className="relative mt-2 block">
        <input
          autoComplete="new-password"
          className="h-11 w-full rounded-lg border border-[#e7ecef] bg-white px-4 pr-12 text-[14px] text-black outline-none transition placeholder:text-[#9aa0a6] focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]"
          minLength={8}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("auth.enterPassword")}
          type={inputType}
          value={value}
        />
        <button
          aria-label={isVisible ? t("auth.hidePassword") : t("auth.showPassword")}
          aria-pressed={isVisible}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#6d737c] transition hover:bg-[#f5f7f8] hover:text-[#2f3338] focus:outline-none focus:ring-2 focus:ring-[#f9a21a]"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          <PasswordVisibilityIcon isVisible={isVisible} />
        </button>
      </span>
    </label>
  );
}

export function ResetPasswordModal({
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
  targetLabel,
}: ResetPasswordModalProps) {
  const { t } = useI18n();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");

  function resetForm() {
    setConfirmPassword("");
    setError("");
    setNewPassword("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPassword = newPassword.trim();

    if (trimmedPassword.length < 8) {
      setError(t("auth.passwordMin"));
      return;
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    try {
      setError("");
      await onSubmit(trimmedPassword);
      resetForm();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : t("common.resetPassword"),
      );
    }
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
      role="dialog"
    >
      <section className="w-full max-w-[420px] rounded-xl border border-[#e7ecef] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-extrabold leading-tight text-black">
              {t("common.resetPassword")}
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[#6d737c]">
              {t("admin.setNewPasswordFor", { target: targetLabel })}
            </p>
          </div>
          <button
            aria-label={t("common.close")}
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
          <PasswordField
            label={t("provider.newPassword")}
            onChange={setNewPassword}
            value={newPassword}
          />
          <PasswordField
            label={t("auth.confirmPassword")}
            onChange={setConfirmPassword}
            value={confirmPassword}
          />
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AdminButton onClick={handleClose} tone="secondary">
              {t("common.cancel")}
            </AdminButton>
            <AdminButton disabled={isSubmitting} type="submit">
              {isSubmitting ? t("common.resetting") : t("common.resetPassword")}
            </AdminButton>
          </div>
        </form>
      </section>
    </div>
  );
}
