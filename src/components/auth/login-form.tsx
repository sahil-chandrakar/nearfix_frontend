"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { useAuthToken } from "@/hooks/use-auth-token";
import { loginUser } from "@/services/auth-service";

export function LoginForm() {
  const { setToken } = useAuthToken();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = await loginUser({ email, password });
      setToken(token.accessToken);
      setMessage("Signed in successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="text-sm font-medium text-teal-700">Welcome back</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
          Sign in
        </h1>
      </div>

      <label className="mt-6 block text-sm font-medium text-slate-700">
        Email
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Password
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>

      <button
        className="mt-6 h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      {message ? (
        <p className="mt-4 text-sm text-slate-600" role="status">
          {message}
        </p>
      ) : null}

      <p className="mt-6 text-sm text-slate-600">
        New to NearFix?{" "}
        <Link className="font-medium text-teal-700" href="/auth/register">
          Create an account
        </Link>
      </p>
    </form>
  );
}
