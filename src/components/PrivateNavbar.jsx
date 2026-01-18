// src/components/PrivateNavbar.jsx
"use client";

import Image from "next/image";
import skullFire from "../../public/skullFire2.png";
import { useRouter } from "next/navigation";
import callBackend from "../lib/callBackend.js";

export default function PrivateNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log("➡️ Calling backend POST /web/api/auth/logout");
      await callBackend.post("/web/api/auth/logout");
      console.log("✅ Logged out");
    } catch (err) {
      console.log("❌ Logout failed:", err?.response?.data?.message || err?.message);
    } finally {
      router.replace("/login");
    }
  };

  return (
    <header className="w-full border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center overflow-hidden">
            
            {skullFire && <Image src={skullFire} alt="Skull on flames" width={40} height={40} priority />}
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Private Routes</p>
            <p className="text-xs text-white/60">Skull Lab Area</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/15 transition"
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-black hover:bg-orange-400 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}