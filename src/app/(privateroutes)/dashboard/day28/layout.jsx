"use client";

// /src/app/(privateroutes)/dashboard/day28/layout.jsx
// Sidebar: icons -> (1) Dashboard Home (/dashboard) (2) Day 28 Home (/dashboard/day28)

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useAuthCheck from "@/checkAuth/authCheck";
import { toast } from "react-toastify";
import {
  FiHome,
  FiGrid,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";

/* ------------------ helpers ------------------ */

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function IconBtn({ href, label, active, children, onClick }) {
  const base =
    "group w-full flex items-center gap-3 rounded-xl border p-3 transition active:scale-[0.99]";
  const styles = active
    ? "border-purple-400/30 bg-purple-500/15 text-purple-100"
    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20";

  const content = (
    <div className={cx(base, styles)} onClick={onClick}>
      <div className={cx("text-xl", active ? "text-purple-200" : "text-white/70")}>
        {children}
      </div>
      <div className="flex-1">
        <div className="text-sm font-extrabold">{label}</div>
        <div className="text-xs text-white/45 group-hover:text-white/60">
          Open
        </div>
      </div>
      <FiChevronRight className={cx("text-white/40", active ? "text-purple-200/70" : "")} />
    </div>
  );

  // Using Link for navigation (fast + correct for Next.js)
  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

/* ------------------ layout ------------------ */

export default function Day28Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const { loading, isAuthenticated, user } = useAuthCheck();

  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    console.log("[Day28Layout] mounted");
  }, []);

  useEffect(() => {
    console.log("[Day28Layout] pathname:", pathname);
  }, [pathname]);

  useEffect(() => {
    console.log("[Day28Layout] auth:", { loading, isAuthenticated, user });
  }, [loading, isAuthenticated, user]);

  const isDashboardHome = pathname === "/dashboard";
  const isDay28Home = pathname === "/dashboard/day28";

  const closeMobile = () => {
    console.log("[Day28Layout] closeMobile");
    setOpenMobile(false);
  };

  const openMobileMenu = () => {
    console.log("[Day28Layout] openMobileMenu");
    setOpenMobile(true);
  };

  const doLogout = () => {
    console.log("[Day28Layout] logout clicked (no backend call here)");
    toast.info("Logout button clicked (wire to backend if you want).", { toastId: "day28-logout" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="font-bold text-white/80">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-purple-700/20 via-purple-700/5 to-transparent" />

      {/* MOBILE TOP BAR */}
      <div className="relative z-20 lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur">
        <button
          onClick={openMobileMenu}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-extrabold text-white/80 hover:bg-white/10"
        >
          <FiMenu className="text-xl" />
        </button>

        <div className="text-sm font-extrabold text-white/80">
          Day 28
        </div>

        <button
          onClick={() => {
            console.log("[Day28Layout] router.back()");
            router.back();
          }}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:bg-white/10"
        >
          Back
        </button>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-2xl border border-white/10 bg-black/40 p-5 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                  <span className="text-lg">☠️</span>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">Day 28</div>
                  <div className="text-xs text-white/60">Sidebar Navigation</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <IconBtn
                  href="/dashboard"
                  label="Dashboard Home"
                  active={isDashboardHome}
                >
                  <FiGrid />
                </IconBtn>

                <IconBtn
                  href="/dashboard/day28"
                  label="Day 28 Home"
                  active={isDay28Home}
                >
                  <FiHome />
                </IconBtn>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60 font-bold">Signed in as</div>
                <div className="mt-1 text-sm text-white/80 break-all">
                  {user?.email || user?.webUserEmail || user?.webUserId || "—"}
                </div>
              </div>

              <button
                onClick={doLogout}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 p-4 font-extrabold text-white/80 transition hover:bg-white/10 flex items-center justify-center gap-2"
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="min-w-0">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-6 shadow-xl">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* MOBILE SIDEBAR DRAWER */}
      {openMobile ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeMobile}
          />

          <div className="absolute left-0 top-0 h-full w-[84%] max-w-[320px] border-r border-white/10 bg-black/90 backdrop-blur p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                  <span className="text-lg">☠️</span>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">Day 28</div>
                  <div className="text-xs text-white/60">Navigation</div>
                </div>
              </div>

              <button
                onClick={closeMobile}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:bg-white/10"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {/* Close drawer after click */}
              <div onClick={closeMobile}>
                <IconBtn
                  href="/dashboard"
                  label="Dashboard Home"
                  active={isDashboardHome}
                >
                  <FiGrid />
                </IconBtn>
              </div>

              <div onClick={closeMobile}>
                <IconBtn
                  href="/dashboard/day28"
                  label="Day 28 Home"
                  active={isDay28Home}
                >
                  <FiHome />
                </IconBtn>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60 font-bold">Signed in as</div>
              <div className="mt-1 text-sm text-white/80 break-all">
                {user?.email || user?.webUserEmail || user?.webUserId || "—"}
              </div>
            </div>

            <button
              onClick={() => {
                doLogout();
                closeMobile();
              }}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 p-4 font-extrabold text-white/80 transition hover:bg-white/10 flex items-center justify-center gap-2"
            >
              <FiLogOut />
              Logout
            </button>

            <div className="mt-6 text-center text-xs text-white/40">
              /dashboard/day28 layout
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}