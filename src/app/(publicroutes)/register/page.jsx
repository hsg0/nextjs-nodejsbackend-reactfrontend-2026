"use client";

import Image from "next/image";
import skullFire from "../../../../public/skullFire2.png";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import callBackend from "../../../lib/callBackend.js";

export default function RegisterPage() {
  const router = useRouter();

  // step 1 = register
  // step 2 = verify OTP
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    console.log("✅ Register typing:", name, value);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const sendVerificationOtp = async (email) => {
    try {
      const payload = { email: String(email).trim().toLowerCase() };
      console.log("➡️ POST /web/api/auth/send-verification-otp", payload);

      const res = await callBackend.post("/web/api/auth/send-verification-otp", payload);

      console.log("✅ send-verification-otp response:", res?.data);
      toast.success("OTP sent! Check your email.");
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send OTP";
      console.log("❌ send-verification-otp error:", msg, err);
      toast.error(msg);
    }
  };

  const onSubmitRegister = async (e) => {
    e.preventDefault();
    console.log("✅ REGISTER SUBMIT:", form);

    // UI validation
    if (!form.name.trim()) return toast.error("Name is required.");
    if (!form.email.trim()) return toast.error("Email is required.");
    if (!form.password) return toast.error("Password is required.");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match.");

    setLoading(true);
    try {
      // backend expects: username, email, password
      const payload = {
        username: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      console.log("➡️ POST /web/api/auth/register", payload);
      const res = await callBackend.post("/web/api/auth/register", payload);

      console.log("✅ register response:", res?.data);
      toast.success("Registered! Sending verification OTP…");

      // Now send verification OTP
      await sendVerificationOtp(payload.email);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Register failed";
      console.log("❌ register error:", msg, err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitVerify = async (e) => {
    e.preventDefault();
    console.log("✅ VERIFY OTP SUBMIT:", { email: form.email, otp });

    if (!form.email.trim()) return toast.error("Email is required.");
    if (!otp.trim()) return toast.error("OTP is required.");

    setLoading(true);
    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        otp: otp.trim(),
      };

      console.log("➡️ POST /web/api/auth/verify-otp", payload);
      const res = await callBackend.post("/web/api/auth/verify-otp", payload);

      console.log("✅ verify-otp response:", res?.data);
      toast.success("Account verified! You can log in now.");

      router.replace("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "OTP verification failed";
      console.log("❌ verify-otp error:", msg, err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const backToRegister = () => {
    console.log("✅ Back to step 1");
    setStep(1);
    setOtp("");
  };

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 shadow-2xl">
          <div className="w-24 h-24 flex items-center justify-center">
            {skullFire && (
              <Image src={skullFire} alt="Skull on flames" width={96} height={96} priority />
            )}
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">
          {step === 1 ? "Create account" : "Verify account"}
        </h1>

        <p className="mt-2 text-sm text-white/70">
          {step === 1
            ? "Join the lab. Build. Break. Learn."
            : "Enter the OTP we sent to your email."}
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 shadow-xl">
        {step === 1 ? (
          <form onSubmit={onSubmitRegister} className="p-6">
            {/* Name */}
            <label className="block">
              <span className="text-sm font-semibold text-white/80">Name</span>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={onChange}
                placeholder="Your name"
                autoComplete="name"
                className="mt-2 w-full rounded-xl bg-black/30 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-orange-500/60"
              />
            </label>

            {/* Email */}
            <label className="mt-4 block">
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

            {/* Password */}
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-white/80">Password</span>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-orange-500/60">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-white/80">Confirm password</span>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-orange-500/60">
                <input
                  name="confirmPassword"
                  type={showPass2 ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={onChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-transparent px-1 py-1 text-white outline-none placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    console.log("✅ Toggle showPass2:", !showPass2);
                    setShowPass2((v) => !v);
                  }}
                  className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
                >
                  {showPass2 ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-3 font-semibold text-black shadow-lg shadow-orange-500/25 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70 transition"
            >
              {loading ? "Creating..." : "Create account"}
            </button>

            <div className="mt-5 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-white/70 hover:text-white"
              >
                Already have an account?
              </button>

              <button
                type="button"
                onClick={() => router.push("/reset-password")}
                className="text-orange-400 hover:text-orange-300 font-semibold"
              >
                Reset password →
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={onSubmitVerify} className="p-6">
            {/* Email */}
            <label className="block">
              <span className="text-sm font-semibold text-white/80">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  console.log("✅ Verify-step email edit:", e.target.value);
                  setForm((p) => ({ ...p, email: e.target.value }));
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className="mt-2 w-full rounded-xl bg-black/30 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-orange-500/60"
              />
            </label>

            {/* OTP */}
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-white/80">OTP</span>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  console.log("✅ OTP typing:", e.target.value);
                  setOtp(e.target.value);
                }}
                placeholder="6-digit code"
                inputMode="numeric"
                className="mt-2 w-full rounded-xl bg-black/30 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-orange-500/60"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-3 font-semibold text-black shadow-lg shadow-orange-500/25 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70 transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="mt-5 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => sendVerificationOtp(form.email)}
                className="text-white/70 hover:text-white"
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={backToRegister}
                className="text-orange-400 hover:text-orange-300 font-semibold"
              >
                ← Back
              </button>
            </div>
          </form>
        )}

        <div className="border-t border-white/10 bg-white/[0.03] px-6 py-4 text-xs text-white/50">
          Dev tip: watch console logs for exact payloads + responses.
        </div>
      </div>
    </div>
  );
}