"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import useAuthCheck from "@/checkAuth/authCheck";

const ArrowIcon = () => <span className="text-white/70">→</span>;
const PdfIcon = () => <span className="text-white/70">📄</span>;
const MagicIcon = () => <span className="text-white/70">✨</span>;
const PlaneIcon = () => <span className="text-white/70">✈️</span>;

function Card({ title, icon: Icon, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-extrabold flex items-center gap-2">
            {Icon ? <Icon className="text-white/70" /> : null}
            <span>{title}</span>
          </div>
          {subtitle ? <div className="text-sm text-white/60 mt-1">{subtitle}</div> : null}
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 px-3 py-1 text-xs text-white/60">
          SkullFire Labs
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function Day27EntryPage() {
  const { loading, isAuthenticated, user } = useAuthCheck();

  useEffect(() => {
    console.log("[Day27EntryPage] mounted");
    console.log("[Day27EntryPage] isAuthenticated:", isAuthenticated);
    console.log("[Day27EntryPage] user:", user);
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-black/40 px-6 py-4 text-white/80">
          Loading Day 27…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-3xl font-extrabold">☠️🔥 Day 27 Entry</div>
        <div className="text-white/60 mt-2">
          You’re about to enter the PDF workflow pages. On the next page, we will let the user
          <span className="text-white"> fill out a PDF</span> (we’ll load the PDF later — not today).
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          title="Step 1 — Auto-generate PDF Fields"
          subtitle="We will build the UI + flow for generating input fields from a PDF form"
          icon={MagicIcon}
        >
          <p className="text-sm text-white/70 leading-relaxed">
            This route will be the start of the lab. We’ll prepare the screen that will later load your
            fillable PDF and map fields into a clean form UI.
          </p>

          <Link
            href="/dashboard/day27/autogeneratepdffeilds"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-purple-500/40 bg-purple-500/15 px-4 py-2 text-sm font-extrabold text-purple-200 hover:bg-purple-500/25 transition"
            onClick={() => console.log("[Day27EntryPage] go to autogeneratepdffields")}
          >
            Go to Step 1 <ArrowIcon />
          </Link>
        </Card>

        <Card
          title="Step 2 — Send Completed PDF"
          subtitle="After the user fills the form, we prepare the final PDF for sending"
          icon={PlaneIcon}
        >
          <p className="text-sm text-white/70 leading-relaxed">
            This route will be used to review + submit the completed PDF (upload/send step). We’ll keep
            it UI-only for now and wire it later.
          </p>

          <Link
            href="/dashboard/day27/sendcompletedpdf"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/30 px-4 py-2 text-sm font-extrabold text-white/80 hover:bg-zinc-900/60 hover:text-white transition"
            onClick={() => console.log("[Day27EntryPage] go to sendcompletedpdf")}
          >
            Open Step 2 <ArrowIcon />
          </Link>
        </Card>

        <Card
          title="Step 3 — PDF Sent (Signed)"
          subtitle="Confirmation + download/view page (signed & delivered)"
          icon={PdfIcon}
        >
          <p className="text-sm text-white/70 leading-relaxed">
            This route will act like a “receipt/confirmation” screen: PDF successfully sent, signed, and
            ready to view or download (later we’ll connect the real link).
          </p>

          <Link
            href="/dashboard/day27/pdfsentsigned"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/30 px-4 py-2 text-sm font-extrabold text-white/80 hover:bg-zinc-900/60 hover:text-white transition"
            onClick={() => console.log("[Day27EntryPage] go to pdfsentsigned")}
          >
            Open Step 3 <ArrowIcon />
          </Link>
        </Card>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5">
        <div className="text-sm font-extrabold text-white">What we are NOT doing yet</div>
        <ul className="mt-2 text-sm text-white/70 list-disc pl-5 space-y-1">
          <li>We are NOT loading the PDF into the browser yet.</li>
          <li>We are NOT generating real form fields yet.</li>
          <li>We are NOT uploading/sending/saving PDFs yet.</li>
        </ul>

        <div className="mt-3 text-xs text-white/50">
          (Next: we will load your test PDF and build the form UI based on detected fields.)
        </div>
      </div>
    </div>
  );
}