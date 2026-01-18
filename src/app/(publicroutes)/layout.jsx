// src/app/(publicroutes)/layout.jsx
"use client";

import skullFire from "../../../public/skullFire2.png";
import { useRouter } from "next/navigation";

export default function PublicRoutesLayout({ children }) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0B0B10] text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm font-semibold tracking-wide text-white hover:text-white/80"
          >
            ← Back
          </button>

          <div className="flex items-center gap-2 text-sm text-white/70">
            <div
              aria-label="Skull on flames"
              className="h-[22px] w-[22px] bg-center bg-no-repeat bg-contain"
              style={{ backgroundImage: `url(${skullFire?.src || skullFire})` }}
            />
            <span>Practice Lab</span>
          </div>

          <nav className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/15"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => router.push("/register")}
              className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-orange-400"
            >
              Register
            </button>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        {children}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-5xl px-6 py-4 text-xs text-white/50">
          © {new Date().getFullYear()} Practice Lab
        </div>
      </footer>
    </main>
  );
}