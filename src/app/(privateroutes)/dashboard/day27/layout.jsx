"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PdfIcon = () => <span className="text-white/70">📄</span>;
const MagicIcon = () => <span className="text-white/70">✨</span>;
const PlaneIcon = () => <span className="text-white/70">✈️</span>;

const navItems = [
  {
    key: "autogeneratepdffields",
    href: "/dashboard/day27/autogeneratepdffields",
    label: "Auto-generate PDF fields",
    icon: MagicIcon,
  },
  {
    key: "sendcompletedpdf",
    href: "/dashboard/day27/sendcompletedpdf",
    label: "Send completed PDF",
    icon: PlaneIcon,
  },
  {
    key: "pdfsentsigned",
    href: "/dashboard/day27/pdfsentsigned",
    label: "PDF sent (signed)",
    icon: PdfIcon,
  },
];

export default function Day27Layout({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    console.log("[Day27Layout] mounted");
    console.log("[Day27Layout] pathname:", pathname);
  }, [pathname]);

  const activeKey = useMemo(() => {
    const match = navItems.find((item) => pathname?.startsWith(item.href));
    return match?.key || "day27";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        {/* Thin Sidebar */}
        <aside className="w-20 border-r border-white/10 bg-black/40 backdrop-blur">
          <div className="h-16 flex items-center justify-center border-b border-white/10">
            <div
              className="h-10 w-10 rounded-2xl border border-white/10 bg-zinc-900/60 flex items-center justify-center shadow"
              title="SkullFire Labs • Day 27"
            >
              <span className="text-lg">☠️</span>
            </div>
          </div>

          <nav className="py-3 flex flex-col items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeKey === item.key;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={[
                    "group relative w-14 h-14 rounded-2xl flex items-center justify-center",
                    "border transition-all duration-200",
                    isActive
                      ? "border-purple-500/60 bg-purple-500/15 shadow-[0_0_0_1px_rgba(168,85,247,0.2)]"
                      : "border-white/10 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-white/20",
                  ].join(" ")}
                  title={item.label}
                  onClick={() => console.log("[Day27Layout] nav click:", item.key)}
                >
                  <Icon
                    className={[
                      "text-xl transition-all duration-200",
                      isActive ? "text-purple-300" : "text-white/70 group-hover:text-white",
                    ].join(" ")}
                  />

                  {/* Tooltip (on hover) */}
                  <div className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition">
                    <div className="whitespace-nowrap rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-xs text-white/80 shadow-lg">
                      {item.label}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-3">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/20 p-2 text-[10px] text-white/60 leading-relaxed">
              <div className="text-white/80 font-extrabold">☠️🔥</div>
              <div>SkullFire</div>
              <div>Day 27</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Top bar inside Day 27 */}
          <div className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-xl font-extrabold">☠️🔥 Day 27 — PDF Workflow Lab</div>
                <div className="text-sm text-white/60">
                  Sidebar routes: auto fields → send completed → sent/signed
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs text-white/50">active:</span>
                <span className="text-xs rounded-full border border-white/10 bg-black/40 px-3 py-1 text-white/70">
                  {activeKey}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}