"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  AdminShell,
} from "@/components/admin/admin-shell";
import { DEFAULT_SUPPORT_DETAILS } from "@/config/support";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import {
  getAdminSupportDetails,
  updateAdminSupportDetails,
} from "@/services/admin-service";
import type { SupportDetails } from "@/types/support";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]";
const textareaClass =
  "mt-2 min-h-28 w-full rounded-lg border border-[#e7ecef] px-4 py-3 text-[14px] leading-6 outline-none focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4]";

export default function AdminSupportPage() {
  const { token } = useAuthToken();
  const [form, setForm] = useState<SupportDetails>(DEFAULT_SUPPORT_DETAILS);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field: keyof SupportDetails, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      getAdminSupportDetails(token)
        .then((details) => {
          if (isMounted) {
            setForm(details);
            setError("");
          }
        })
        .catch((caughtError) => {
          if (isMounted) {
            setError(
              caughtError instanceof ApiError
                ? caughtError.message
                : "Unable to load support details.",
            );
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const saved = await updateAdminSupportDetails(token, {
        ...form,
        footerSiteName: form.footerSiteName.trim(),
        adminPhone: form.adminPhone.trim(),
        email: form.email.trim(),
        helpHeadingEn: form.helpHeadingEn.trim(),
        helpHeadingHi: form.helpHeadingHi.trim(),
        helpDescriptionEn: form.helpDescriptionEn.trim(),
        helpDescriptionHi: form.helpDescriptionHi.trim(),
      });
      setForm(saved);
      setMessage("Support details updated.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update support details.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle="Edit the customer footer, Help page support text, and shared contact details."
        title="Support"
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

      <AdminCard>
        {isLoading ? (
          <p className="text-[14px] text-[#6d737c]">Loading support details...</p>
        ) : (
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-[14px] font-semibold text-[#2f3338]">
                Footer site name
                <input
                  className={inputClass}
                  maxLength={80}
                  onChange={(event) => updateField("footerSiteName", event.target.value)}
                  required
                  value={form.footerSiteName}
                />
              </label>
              <label className="text-[14px] font-semibold text-[#2f3338]">
                Admin phone
                <input
                  className={inputClass}
                  maxLength={10}
                  onChange={(event) => updateField("adminPhone", event.target.value)}
                  pattern="\d{10}"
                  required
                  value={form.adminPhone}
                />
              </label>
              <label className="text-[14px] font-semibold text-[#2f3338]">
                Email
                <input
                  className={inputClass}
                  maxLength={255}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                  type="email"
                  value={form.email}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-[14px] font-semibold text-[#2f3338]">
                Help heading English
                <input
                  className={inputClass}
                  maxLength={120}
                  onChange={(event) => updateField("helpHeadingEn", event.target.value)}
                  required
                  value={form.helpHeadingEn}
                />
              </label>
              <label className="text-[14px] font-semibold text-[#2f3338]">
                Help heading Hindi
                <input
                  className={inputClass}
                  maxLength={120}
                  onChange={(event) => updateField("helpHeadingHi", event.target.value)}
                  required
                  value={form.helpHeadingHi}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-[14px] font-semibold text-[#2f3338]">
                Help description English
                <textarea
                  className={textareaClass}
                  maxLength={500}
                  onChange={(event) => updateField("helpDescriptionEn", event.target.value)}
                  required
                  value={form.helpDescriptionEn}
                />
              </label>
              <label className="text-[14px] font-semibold text-[#2f3338]">
                Help description Hindi
                <textarea
                  className={textareaClass}
                  maxLength={500}
                  onChange={(event) => updateField("helpDescriptionHi", event.target.value)}
                  required
                  value={form.helpDescriptionHi}
                />
              </label>
            </div>

            <div className="flex justify-end">
              <AdminButton disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : "Save Support Details"}
              </AdminButton>
            </div>
          </form>
        )}
      </AdminCard>
    </AdminShell>
  );
}
