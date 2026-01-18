// src/app/(publicroutes)/login/layout.jsx
"use client";

import { useRouter } from "next/navigation";

export default function LoginLayout({ children }) {
  const router = useRouter();

  return (
    <section className="mx-auto w-full max-w-md">
      {/* Card */}
      <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 shadow-2xl">
        {/* Top row */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm font-semibold text-white/70 hover:text-white"
          >
            ← Home
          </button>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-sm font-semibold text-orange-400 hover:text-orange-300"
          >
            Register →
          </button>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight">Login</h1>
        <p className="mt-2 text-sm text-white/70">
          Welcome back. Enter your details to sign in.
        </p>

        <div className="mt-6">{children}</div>
      </div>

      {/* Helper note */}
      <p className="mt-4 text-center text-xs text-white/45">
        Tip: You can change this layout at{" "}
        <span className="text-white/70">
          src/app/(publicroutes)/login/layout.jsx
        </span>
      </p>
    </section>
  );
}