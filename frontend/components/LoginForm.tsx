"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { login, loginAsDefaultUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDemoUser() {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginAsDefaultUser();
      router.push("/");
    } catch {
      setError("Couldn't log in as the demo user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-xl border border-zoom-gray-200 bg-white p-6 shadow-card"
    >
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-zoom-gray-800">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-zoom-gray-300 px-3 py-2 text-sm outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-zoom-gray-800">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-md border border-zoom-gray-300 px-3 py-2 text-sm outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
        />
      </div>

      {error && <p className="mb-4 text-sm text-zoom-red">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-zoom-blue py-2.5 text-sm font-semibold text-white transition hover:bg-zoom-blue-dark disabled:opacity-60"
      >
        {isSubmitting ? "Logging in…" : "Log In"}
      </button>

      <button
        type="button"
        onClick={handleDemoUser}
        disabled={isSubmitting}
        className="mt-3 w-full rounded-md border border-zoom-gray-200 py-2.5 text-sm font-semibold text-zoom-gray-700 transition hover:border-zoom-blue hover:text-zoom-blue disabled:opacity-60"
      >
        Continue as Demo User
      </button>

      <p className="mt-4 text-center text-sm text-zoom-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-zoom-blue hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
