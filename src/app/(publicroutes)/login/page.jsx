"use client";

import Image from "next/image";
import skullFire from "../../../../public/skullFire2.png";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import callBackend from "../../../lib/callBackend.js";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    console.log("✅ Login typing:", name, value);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("✅ LOGIN SUBMIT:", form);

    if (!form.email.trim()) return toast.error("Email is required.");
    if (!form.password) return toast.error("Password is required.");

    setLoading(true);
    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      console.log("➡️ POST /web/api/auth/login", payload);
      const res = await callBackend.post("/web/api/auth/login", payload);

      console.log("✅ login response:", res?.data);
      toast.success("Login successful!");

      // ✅ route groups do NOT exist in URL
      router.replace("/dashboard");
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Login failed";
      console.log("❌ login error:", status, msg, err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 shadow-2xl">
          <div className="w-24 h-24 flex items-center justify-center">
            {skullFire && (
              <Image src={skullFire} alt="Skull on flames" width={96} height={96} priority />
            )}
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">Log in</h1>
        <p className="mt-2 text-sm text-white/70">
          Enter the lab. Keep it clean. Keep it sharp.
        </p>
      </div>

      <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 shadow-xl">
        <form onSubmit={onSubmit} className="p-6">
          <label className="block">
            <span className="text-sm font-semibold text-white/80">Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-2 w-full rounded-xl bg-black/30 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-orange-500/60"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-semibold text-white/80">Password</span>

            <div className="mt-2 flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-orange-500/60">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-transparent px-1 py-1 text-white outline-none placeholder:text-white/30"
              />
              <button
                type="button"
                onClick={() => {
                  console.log("✅ Toggle showPass:", !showPass);
                  setShowPass((v) => !v);
                }}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-3 font-semibold text-black shadow-lg shadow-orange-500/25 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70 transition"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <div className="mt-5 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => router.push("/reset-password")}
              className="text-white/70 hover:text-white"
            >
              Forgot password?
            </button>

            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-orange-400 hover:text-orange-300 font-semibold"
            >
              Create account →
            </button>
          </div>
        </form>

        <div className="border-t border-white/10 bg-white/[0.03] px-6 py-4 text-xs text-white/50">
          Dev tip: check console logs for backend response + cookie behavior.
        </div>
      </div>
    </div>
  );
}