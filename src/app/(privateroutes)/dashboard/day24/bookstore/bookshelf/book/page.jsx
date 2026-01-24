// src/app/(privateroutes)/dashboard/day24/bookstore/bookshelf/book/page.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthCheck from "@/checkAuth/authCheck.js";

function Header({ title, subtitle, onBack, shelfTitle }) {
  return (
    <div className="rounded-2xl border border-red-600/25 bg-zinc-950 p-6 shadow-[0_0_0_1px_rgba(255,0,0,0.08),0_20px_60px_rgba(0,0,0,0.6)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-white/60">SkullFire Library</div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 truncate">
            {title}
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/70">{subtitle}</p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-white/70">
            <span className="text-white/60">Shelf:</span>
            <span className="font-bold text-white truncate max-w-[240px]">
              {shelfTitle || "Unknown"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <button
            onClick={onBack}
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/80 hover:bg-black/60 hover:border-white/20"
          >
            ← Back to Shelf
          </button>
          <div className="text-3xl">📕</div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
      <div className="text-[11px] tracking-wide text-white/60">{label}</div>
      <div className="mt-1 font-extrabold text-white">{value}</div>
    </div>
  );
}

function ActionButton({
  icon,
  title,
  subtitle,
  variant = "primary",
  onClick,
  disabled,
}) {
  const base =
    "w-full rounded-2xl px-5 py-4 font-extrabold transition active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-red-600 to-orange-500 text-black hover:brightness-110"
      : variant === "ghost"
      ? "border border-white/10 bg-black/40 text-white hover:bg-black/60 hover:border-white/20"
      : "border border-red-500/30 bg-zinc-950 text-white hover:border-red-500/60";

  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="text-2xl">{icon}</div>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-lg md:text-xl truncate">{title}</div>
          <div className="mt-1 text-sm font-semibold text-black/70 md:text-white/70">
            {subtitle}
          </div>
        </div>
        <div className="text-white/70">→</div>
      </div>
    </button>
  );
}

function BookCover({ seed, title, author, available }) {
  return (
    <div className="relative w-full max-w-[360px]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_24px_70px_rgba(0,0,0,0.65)]">
        {/* glow */}
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.26),transparent_55%),radial-gradient(circle_at_bottom,rgba(255,140,0,0.18),transparent_55%)]" />
        {/* texture */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:28px_28px]" />

        {/* spine */}
        <div className="absolute inset-y-0 left-0 w-7 border-r border-white/10 bg-zinc-950/70" />
        <div className="absolute inset-y-0 left-[6px] w-[2px] bg-white/10" />

        {/* badge */}
        <div className="absolute top-4 right-4">
          <div
            className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
              available
                ? "bg-white text-black"
                : "bg-black/60 text-white border border-white/10"
            }`}
          >
            {available ? "AVAILABLE" : "CHECKED OUT"}
          </div>
        </div>

        <div className="relative p-6 h-full flex flex-col justify-between">
          <div>
            <div className="text-xs text-white/60">SkullFire Edition</div>
            <div className="mt-3 text-2xl font-extrabold leading-tight line-clamp-3">
              {title || "Unknown Title"}
            </div>
            <div className="mt-2 text-sm text-white/70 line-clamp-2">
              {author || "Unknown Author"}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="text-xs text-white/50">ID: {seed}</div>
            <div className="text-4xl">☠️🔥</div>
          </div>
        </div>
      </div>

      {/* bottom “shadow base” */}
      <div className="mt-3 h-2 w-full rounded-full bg-zinc-950/70 border border-white/10" />
    </div>
  );
}

export default function Day24BookFocusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, user } = useAuthCheck();

  const shelfId = searchParams.get("shelfId") || "unknown";
  const shelfTitle =
    searchParams.get("shelfTitle") || searchParams.get("title") || "Shelf";

  const bookId = searchParams.get("bookId") || "unknown-book";
  const title = searchParams.get("title") || "Unknown Book";
  const author = searchParams.get("author") || "Unknown Author";
  const pages = Number(searchParams.get("pages") || "0");
  const available = (searchParams.get("available") || "true") === "true";

  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    console.log("[Day24BookFocusPage] loaded");
    console.log("[Day24BookFocusPage] shelfId:", shelfId);
    console.log("[Day24BookFocusPage] shelfTitle:", shelfTitle);
    console.log("[Day24BookFocusPage] bookId:", bookId);
    console.log("[Day24BookFocusPage] title:", title);
    console.log("[Day24BookFocusPage] author:", author);
    console.log("[Day24BookFocusPage] pages:", pages);
    console.log("[Day24BookFocusPage] available:", available);
  }, [shelfId, shelfTitle, bookId, title, author, pages, available]);

  const availabilityLabel = useMemo(() => (available ? "Available" : "Checked Out"), [available]);

  const onBack = () => {
    console.log("➡️ [Day24BookFocusPage] back to shelf");
    const qp = new URLSearchParams();
    qp.set("shelfId", shelfId);
    qp.set("title", shelfTitle);
    router.push(`/dashboard/day24/bookstore/bookshelf?${qp.toString()}`);
  };

  const onRead = () => {
    console.log("➡️ [Day24BookFocusPage] READ clicked:", bookId);
    setStatusNote("📖 Read mode (UI placeholder). Next: open a reader or PDF view.");
  };

  const onDownload = () => {
    console.log("➡️ [Day24BookFocusPage] DOWNLOAD clicked:", bookId);
    setStatusNote("⬇️ Download started (UI placeholder). Next: backend returns a file URL.");
  };

  const onCheckout = () => {
    console.log("➡️ [Day24BookFocusPage] CHECKOUT clicked:", bookId);

    if (!available) {
      setStatusNote("❌ This book is currently checked out.");
      return;
    }

    setStatusNote("✅ Checkout success (UI placeholder). Next: write checkout API + update availability.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* background */}
      <div className="pointer-events-none fixed inset-0 opacity-25 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.14),transparent_55%),radial-gradient(circle_at_bottom,rgba(255,140,0,0.12),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl">
        <Header
          title="Book Focus"
          subtitle="Cover + details + actions. Choose Read / Download / Checkout."
          onBack={onBack}
          shelfTitle={shelfTitle}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Cover panel */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <div className="text-xs text-white/60 mb-4 tracking-wide">
              BOOK COVER
            </div>

            <div className="flex justify-center">
              <BookCover
                seed={bookId}
                title={title}
                author={author}
                available={available}
              />
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-zinc-950/60 p-4">
              <div className="text-xs text-white/60">SIGNED IN</div>
              <div className="mt-1 font-bold">
                {user?.email || "unknown@email"}{" "}
                <span className="text-white/50 font-normal">
                  ({user?.name || user?.fullName || "SkullFire Member"})
                </span>
              </div>
            </div>
          </div>

          {/* MIDDLE: Details */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-white/60 tracking-wide">
                  BOOK DETAILS
                </div>
                <div className="mt-2 text-2xl font-extrabold leading-tight">
                  {title}
                </div>
                <div className="mt-2 text-white/70">
                  <span className="font-bold text-white/85">Author:</span>{" "}
                  {author}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-2 text-xs text-white/70">
                <div className="font-extrabold text-white">
                  {availabilityLabel}
                </div>
                <div className="mt-1">{pages ? `${pages} pages` : "— pages"}</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatPill label="Availability" value={availabilityLabel} />
              <StatPill label="Pages" value={pages ? String(pages) : "—"} />
              <StatPill label="Book ID" value={bookId} />
              <StatPill label="Shelf ID" value={shelfId} />
            </div>

            <div className="mt-5 rounded-xl border border-red-500/20 bg-black/60 p-4">
              <div className="text-xs text-white/60">NOTES</div>
              <div className="mt-2 text-sm text-white/75">
                This page will later fetch the real book from MongoDB using{" "}
                <span className="font-bold text-white">bookId</span>, and show the
                real cover image URL + download URL + reader URL.
              </div>
            </div>

            {statusNote ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-zinc-950/70 p-4 text-sm text-white/80">
                {statusNote}
              </div>
            ) : null}
          </div>

          {/* RIGHT: Actions */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <div className="text-xs text-white/60 tracking-wide">ACTIONS</div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              <ActionButton
                icon="📖"
                title="Read"
                subtitle="Open the book in reader mode."
                variant="primary"
                onClick={onRead}
              />

              <ActionButton
                icon="⬇️"
                title="Download"
                subtitle="Download the book file to your device."
                variant="ghost"
                onClick={onDownload}
              />

              <ActionButton
                icon="🧾"
                title="Checkout"
                subtitle={
                  available
                    ? "Reserve this book and mark it as checked out."
                    : "Unavailable right now (already checked out)."
                }
                variant="danger"
                onClick={onCheckout}
                disabled={!available}
              />
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950/70 p-4 text-xs text-white/60">
              Backend routes later:
              <div className="mt-2 text-white/75">
                POST /web/api/day24/books/:id/checkout
              </div>
              <div className="mt-1 text-white/75">
                POST /web/api/day24/books/:id/return
              </div>
              <div className="mt-1 text-white/75">
                GET /web/api/day24/books/:id (read/download URLs)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}