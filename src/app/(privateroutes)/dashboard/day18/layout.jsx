// src/app/(privateroutes)/dashboard/day18/layout.jsx
"use client";

import { usePathname, useRouter } from "next/navigation";

/* ---------------- Icons ---------------- */
function IconHome({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 21.5V14a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBox({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 2 3.5 6.5 12 11l8.5-4.5L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 6.5V17.5L12 22l8.5-4.5V6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 11v11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSpark({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 2l2.1 6.3L20 10l-5.9 1.7L12 18l-2.1-6.3L4 10l5.9-1.7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M5 20l1-3M19 20l-1-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChat({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M20 14a4 4 0 0 1-4 4H9l-5 3V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 9h8M8 13h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGear({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a8.3 8.3 0 0 0 .1-1 8.3 8.3 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1l-.4-2.6H11l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a8.3 8.3 0 0 0-.1 1 8.3 8.3 0 0 0 .1 1l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.4 2.6h4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------- SkullFire Mark ---------------- */
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

/* ---------------- Nav Icon Button (router.push) ---------------- */
function NavIconButton({ href, active, label, children }) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        console.log("[Day18Layout] nav ->", href);
        router.push(href);
      }}
      className={[
        "group relative flex items-center justify-center",
        "w-12 h-12 rounded-2xl ring-1 transition",
        "focus:outline-none focus:ring-2 focus:ring-orange-400/40",
        active
          ? "bg-orange-500/15 ring-orange-400/30 text-orange-200"
          : "bg-white/5 ring-white/10 text-white/70 hover:text-white hover:bg-white/10",
      ].join(" ")}
    >
      {children}

      {/* Tooltip */}
      <span
        className={[
          "pointer-events-none absolute left-14 top-1/2 -translate-y-1/2",
          "whitespace-nowrap rounded-xl px-3 py-1 text-xs",
          "bg-zinc-950 ring-1 ring-white/10 shadow-xl",
          "opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}

export default function Day18Layout({ children }) {
  const pathname = usePathname();

  // 5 buttons - centered in sidebar
  const nav = [
    { href: "/dashboard/day18", label: "Day 18 Home", Icon: IconHome },
    { href: "/dashboard/day18/products", label: "Products", Icon: IconBox },
    { href: "/dashboard/day18", label: "Ad Builder", Icon: IconSpark }, // points to entry (flow starts here)
    { href: "/dashboard/day18/chat", label: "Chat", Icon: IconChat },
    { href: "/dashboard/day18/settings", label: "Settings", Icon: IconGear },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-30 bg-orange-500" />
        <div className="absolute top-32 -left-24 h-80 w-80 rounded-full blur-3xl opacity-20 bg-red-500" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-[70vw] rounded-full blur-3xl opacity-10 bg-amber-300" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Sidebar: flush left, narrow, no margin/padding on left edge */}
        <aside className="w-[84px] shrink-0 border-r border-white/10 bg-zinc-950/70 backdrop-blur">
          <div className="flex h-full flex-col items-center">
            {/* Brand */}
            <div className="mt-4 mb-2 flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-2 rounded-3xl blur-lg opacity-70 bg-gradient-to-r from-orange-500 via-red-500 to-amber-400" />
                <div className="relative rounded-3xl bg-zinc-950 ring-1 ring-white/10 p-2">
                  <SkullFireMark className="h-8 w-8 text-orange-300" />
                </div>
              </div>
            </div>

            {/* Centered buttons */}
            <div className="flex flex-1 items-center">
              <div className="flex flex-col gap-4">
                {nav.map((item) => {
                  const isHome = item.href === "/dashboard/day18";
                  const active = isHome
                    ? pathname === item.href
                    : pathname?.startsWith(item.href);

                  const Icon = item.Icon;

                  return (
                    <NavIconButton
                      key={item.label}
                      href={item.href}
                      label={item.label}
                      active={active}
                    >
                      <Icon className="h-6 w-6" />
                    </NavIconButton>
                  );
                })}
              </div>
            </div>

            {/* Footer hint */}
            <div className="mb-4 text-[10px] text-white/40 text-center px-1">
              SkullFire
              <div className="text-white/30">Day 18</div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}