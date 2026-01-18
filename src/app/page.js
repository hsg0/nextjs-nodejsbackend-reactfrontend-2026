"use client";

import { useRouter } from "next/navigation";

function SkullFireMark({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path
        d="M34 6c2 6-2 10-6 14-5 5-6 10-4 16 2 8 10 12 18 10 9-2 15-10 14-19-1-9-8-15-13-21 1 6-2 9-9 10z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 37c0-9 7-16 16-16s16 7 16 16c0 6-3 11-8 14v6c0 2-2 4-4 4H28c-2 0-4-2-4-4v-6c-5-3-8-8-8-14z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M26 39c0 2-1 3-3 3s-3-1-3-3 1-3 3-3 3 1 3 3zm18 0c0 2-1 3-3 3s-3-1-3-3 1-3 3-3 3 1 3 3z"
        fill="currentColor"
      />
      <path
        d="M24 50h16M28 50v6M36 50v6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl opacity-25 bg-orange-500" />
        <div className="absolute top-36 -left-24 h-96 w-96 rounded-full blur-3xl opacity-20 bg-red-500" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[28rem] w-[70vw] rounded-full blur-3xl opacity-10 bg-amber-300" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-16">
        <section className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 shadow-2xl">
          {/* Header */}
          <div className="px-6 sm:px-10 py-10 sm:py-12">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-2 rounded-3xl blur-lg opacity-70 bg-gradient-to-r from-orange-500 via-red-500 to-amber-400" />
                <div className="relative rounded-3xl bg-zinc-950 ring-1 ring-white/10 p-3">
                  <SkullFireMark className="h-10 w-10 text-orange-300" />
                </div>
              </div>

              <div>
                <div className="text-xs text-white/50">SkullFire • Practice Project</div>
                <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight">
                  Welcome to SkullFire
                </h1>
              </div>
            </div>

            <p className="mt-6 text-white/75 leading-relaxed">
              Login to access your private dashboard and daily builds, or register to create a new account.
              This app uses a dark forge theme — fast, clean, and built for shipping.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className={[
                  "inline-flex items-center justify-center",
                  "rounded-2xl px-6 py-3 text-sm font-semibold",
                  "bg-orange-500/20 hover:bg-orange-500/25",
                  "text-orange-200 ring-1 ring-orange-400/30",
                  "transition focus:outline-none focus:ring-2 focus:ring-orange-400/40",
                ].join(" ")}
              >
                Login →
              </button>

              <button
                type="button"
                onClick={() => router.push("/register")}
                className={[
                  "inline-flex items-center justify-center",
                  "rounded-2xl px-6 py-3 text-sm font-semibold",
                  "bg-white/5 hover:bg-white/10",
                  "text-white ring-1 ring-white/10",
                  "transition focus:outline-none focus:ring-2 focus:ring-white/20",
                ].join(" ")}
              >
                Register
              </button>
            </div>

            {/* Mini features */}
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
                <div className="text-xs text-white/50">Secure</div>
                <div className="mt-1 text-sm font-medium text-white">JWT + Cookies</div>
                <div className="mt-1 text-xs text-white/60">Protected routes + sessions</div>
              </div>

              <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
                <div className="text-xs text-white/50">Daily Builds</div>
                <div className="mt-1 text-sm font-medium text-white">Day 17 / 18 / 76</div>
                <div className="mt-1 text-xs text-white/60">Practice features fast</div>
              </div>

              <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
                <div className="text-xs text-white/50">SkullFire UI</div>
                <div className="mt-1 text-sm font-medium text-white">Forge Theme</div>
                <div className="mt-1 text-xs text-white/60">Orange glow + dark panels</div>
              </div>
            </div>
          </div>

          {/* Footer strip */}
          <div className="px-6 sm:px-10 py-4 border-t border-white/10 bg-zinc-950/40">
            <div className="text-xs text-white/50">
              Tip: If login fails, check backend is running and cookies are enabled.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}