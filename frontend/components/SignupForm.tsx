"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/context/AuthContext";

export default function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(email, name, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create your account. Please try again.");
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
        <label className="mb-1 block text-sm font-medium text-zoom-gray-800">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-zoom-gray-300 px-3 py-2 text-sm outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
        />
      </div>

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
          minLength={8}
          className="w-full rounded-md border border-zoom-gray-300 px-3 py-2 text-sm outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
        />
        <p className="mt-1 text-xs text-zoom-gray-600">At least 8 characters.</p>
      </div>

      {error && <p className="mb-4 text-sm text-zoom-red">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-zoom-blue py-2.5 text-sm font-semibold text-white transition hover:bg-zoom-blue-dark disabled:opacity-60"
      >
        {isSubmitting ? "Creating account…" : "Sign Up"}
      </button>

      <p className="mt-4 text-center text-sm text-zoom-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zoom-blue hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
