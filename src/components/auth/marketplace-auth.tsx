"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { useId, useState } from "react";
import Link from "next/link";

type AuthPageProps = {
  children: ReactNode;
  subtitle: string;
};

type AuthCardProps = {
  children: ReactNode;
  description: string;
  title: string;
};

type TextFieldProps = {
  label: string;
  placeholder: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

type FileFieldProps = {
  label: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "accept" | "className" | "type">;

export function AuthPage({ children, subtitle }: AuthPageProps) {
  return (
    <main className="px-4 pb-12 pt-7 sm:px-6 md:px-8 md:pb-20 md:pt-12 lg:px-10">
      <div className="mx-auto flex w-full max-w-[430px] flex-col items-center md:max-w-[720px]">
        <div className="flex flex-col items-center text-center">
          <p className="text-[19px] font-normal leading-7 tracking-normal text-[#5d6670]">
            {subtitle}
          </p>
        </div>

        {children}
      </div>
    </main>
  );
}

export function AuthCard({ children, description, title }: AuthCardProps) {
  return (
    <section className="mt-10 w-full rounded-xl border border-[#e7ecef] bg-white px-6 py-7 shadow-[0_2px_12px_rgba(15,23,42,0.08)] md:px-8 md:py-9">
      <h1 className="text-[29px] font-extrabold leading-tight tracking-normal text-black md:text-[34px]">
        {title}
      </h1>
      <p className="mt-2 text-[16px] font-normal leading-6 tracking-normal text-[#7a7f86] md:text-[18px] md:leading-7">
        {description}
      </p>
      <div className="mt-7">{children}</div>
    </section>
  );
}

export function TextField({
  id,
  label,
  placeholder,
  type = "text",
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputId = id ?? generatedId;
  const isPasswordField = type === "password";
  const inputType = isPasswordField && isPasswordVisible ? "text" : type;

  return (
    <div className="block text-[16px] font-medium leading-none tracking-normal text-[#2f3338]">
      <label htmlFor={inputId}>
      {label}
      </label>
      <div className="relative mt-3">
        <input
          {...inputProps}
          className={`h-[52px] w-full rounded-lg border border-[#e7ecef] bg-white px-4 text-[16px] tracking-normal text-black outline-none transition placeholder:text-[#9aa0a6] focus:border-[#f9a21a] focus:ring-2 focus:ring-[#fff0d4] ${
            isPasswordField ? "pr-12" : ""
          }`}
          id={inputId}
          placeholder={placeholder}
          type={inputType}
        />
        {isPasswordField ? (
          <button
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            aria-pressed={isPasswordVisible}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[#6d737c] transition hover:bg-[#f5f7f8] hover:text-[#2f3338] focus:outline-none focus:ring-2 focus:ring-[#f9a21a]"
            onClick={() => setIsPasswordVisible((current) => !current)}
            type="button"
          >
            {isPasswordVisible ? (
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
            ) : (
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
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function FileField({ label, ...inputProps }: FileFieldProps) {
  return (
    <label className="block text-[16px] font-medium leading-none tracking-normal text-[#2f3338]">
      {label}
      <span className="mt-3 flex h-[52px] w-full cursor-pointer items-center gap-3 rounded-lg border border-[#e7ecef] bg-white px-4 text-[16px] font-normal tracking-normal text-[#7a7f86] transition hover:border-[#f9a21a]">
        <svg
          aria-hidden="true"
          className="h-5 w-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="m10 13-2 2 2 2" />
          <path d="m14 13 2 2-2 2" />
        </svg>
        Choose JPG file
      </span>
      <input {...inputProps} accept="image/jpeg" className="sr-only" type="file" />
    </label>
  );
}

export function PrimaryButton({
  children,
  ...buttonProps
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...buttonProps}
      className="h-[52px] w-full rounded-lg bg-[#f9a21a] px-5 text-[17px] font-medium tracking-normal text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-[#ee9914] focus:outline-none focus:ring-2 focus:ring-[#f9a21a] focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:bg-[#f7c982]"
      type={buttonProps.type ?? "button"}
    >
      {children}
    </button>
  );
}

export function AuthLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      className="font-medium text-[#d69a2d] transition hover:text-[#f9a21a]"
      href={href}
    >
      {children}
    </Link>
  );
}

export function FieldStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-6">{children}</div>;
}
