// src/app/(publicroutes)/reset-password/layout.jsx
"use client";

import skullFire from "../../../../public/skullFire2.png";
import { useRouter } from "next/navigation";

export default function ResetPasswordLayout({ children }) {
  const router = useRouter();

  return (
    <section className="relative">
      {/* slightly different glow for reset */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-red-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

      {/* header */}
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm font-semibold text-white/70 hover:text-white"
          >
            ← Back to Login
          </button>

          <div className="flex items-center gap-2">
            <div
              aria-label="Skull on flames"
              className="h-[28px] w-[28px] bg-center bg-no-repeat bg-contain"
              style={{ backgroundImage: `url(${skullFire?.src || skullFire})` }}
            />
            <span className="text-sm font-semibold text-white/80">
              Practice Lab
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-sm font-semibold text-orange-400 hover:text-orange-300"
          >
            Register →
          </button>
        </div>
      </div>

      {/* page */}
      {children}
    </section>
  );
}