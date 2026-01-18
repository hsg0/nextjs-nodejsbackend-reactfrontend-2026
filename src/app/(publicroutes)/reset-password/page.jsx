// src/app/(publicroutes)/reset-password/page.jsx
"use client";

import skullFire from "../../../../public/skullFire2.png";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import callBackend from "../../../lib/callBackend.js";

export default function ResetPasswordPage() {
  const router = useRouter();

  // STEP CONTROL
  // step 1 = send OTP
  // step 2 = submit OTP + new password
  const [step, setStep] = useState(1);

  // FORM FIELDS
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // UI STATE
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    console.log("✅ SEND RESET OTP SUBMIT:", { email });

    if (!email.trim()) {
      console.log("❌ Email missing");
      toast.error("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = { email: email.trim().toLowerCase() };
      console.log("➡️ Calling backend POST /web/api/auth/send-reset-password-otp", payload);

      const res = await callBackend.post("/web/api/auth/send-reset-password-otp", payload);

      console.log("✅ send-reset-password-otp response:", res?.data);
      toast.success("OTP sent! Check your email.");

      // Move to step 2 (enter OTP + new password)
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send OTP";
      console.log("❌ send-reset-password-otp error:", msg, err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    console.log("✅ RESET PASSWORD SUBMIT:", { email, otp, newPassword });

    if (!email.trim()) {
      console.log("❌ Email missing");
      toast.error("Email is required.");
      return;
    }
    if (!otp.trim()) {
      console.log("❌ OTP missing");
      toast.error("OTP is required.");
      return;
    }
    if (!newPassword) {
      console.log("❌ New password missing");
      toast.error("New password is required.");
      return;
    }
    if (newPassword.length < 6) {
      console.log("❌ New password too short");
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      };

      console.log("➡️ Calling backend POST /web/api/auth/reset-password", payload);

      const res = await callBackend.post("/web/api/auth/reset-password", payload);

      console.log("✅ reset-password response:", res?.data);
      toast.success("Password reset successful! You can log in now.");

      router.replace("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to reset password";
      console.log("❌ reset-password error:", msg, err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const goBackToStep1 = () => {
    console.log("✅ Going back to STEP 1 (send OTP)");
    setStep(1);
    setOtp("");
    setNewPassword("");
  };

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div
          aria-label="Skull on flames"
          className="mb-4 h-[96px] w-[96px] bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: `url(${skullFire?.src || skullFire})` }}
        />

        <h1 className="text-3xl font-extrabold tracking-tight">Reset password</h1>

        <p className="mt-2 text-sm text-white/70">
          {step === 1
            ? "Enter your email and we’ll send an OTP."
            : "Enter the OTP and your new password."}
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 shadow-xl">
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="p-6">
            <label className="block">
              <span className="text-sm font-semibold text-white/80">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  console.log("✅ Email typing:", e.target.value);
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className="mt-2 w-full rounded-xl bg-black/30 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-orange-500/60"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-3 font-semibold text-black shadow-lg shadow-orange-500/25 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70 transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <div className="mt-5 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-white/70 hover:text-white"
              >
                Back to login
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
        ) : (
          <form onSubmit={handleResetPassword} className="p-6">
            {/* Email (locked but editable if they want) */}
            <label className="block">
              <span className="text-sm font-semibold text-white/80">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  console.log("✅ Email updated (step2):", e.target.value);
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
                  setOtp(e.target.value);
                  console.log("✅ OTP typing:", e.target.value);
                }}
                placeholder="6-digit code"
                inputMode="numeric"
                className="mt-2 w-full rounded-xl bg-black/30 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-orange-500/60"
              />
            </label>

            {/* New Password */}
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-white/80">
                New password
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-orange-500/60">
                <input
                  type={showPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    console.log("✅ New password typing (length):", e.target.value.length);
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-transparent px-1 py-1 text-white outline-none placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPass((v) => !v);
                    console.log("✅ Toggle showPass:", !showPass);
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
              {loading ? "Resetting..." : "Reset password"}
            </button>

            <div className="mt-5 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={goBackToStep1}
                className="text-white/70 hover:text-white"
              >
                ← Resend OTP
              </button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-orange-400 hover:text-orange-300 font-semibold"
              >
                Back to login →
              </button>
            </div>
          </form>
        )}

        <div className="border-t border-white/10 bg-white/[0.03] px-6 py-4 text-xs text-white/50">
          Dev tip: watch console logs for the exact payload sent to backend.
        </div>
      </div>
    </div>
  );
}