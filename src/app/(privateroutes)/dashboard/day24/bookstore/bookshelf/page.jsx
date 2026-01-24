// src/app/(privateroutes)/dashboard/day24/bookstore/bookshelf/page.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthCheck from "@/checkAuth/authCheck.js";
import callBackend from "@/lib/callBackend.js";

function Header({ title, subtitle, onBack, shelfIcon }) {
  return (
    <div className="rounded-2xl border border-red-600/25 bg-zinc-950 p-6 shadow-[0_0_0_1px_rgba(255,0,0,0.08),0_20px_60px_rgba(0,0,0,0.6)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-white/60">SkullFire Library</div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
            {shelfIcon ? `${shelfIcon} ` : ""}
            {title}
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/70">{subtitle}</p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <button
            onClick={onBack}
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/80 hover:bg-black/60 hover:border-white/20"
          >
            ← Back to Shelves
          </button>
          <div className="text-3xl">🗂️</div>
        </div>
      </div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function BookCover({ title, author, seed, available }) {
  return (
    <div className="relative w-full">
      <div className="relative aspect-[3/4] rounded-2xl border border-white/10 bg-black/45 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.22),transparent_55%),radial-gradient(circle_at_bottom,rgba(255,140,0,0.14),transparent_55%)]" />

        <div className="absolute inset-y-0 left-0 w-6 border-r border-white/10 bg-zinc-950/70" />
        <div className="absolute inset-y-0 left-1 w-[2px] bg-white/10" />

        <div className="relative h-full p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-white/60">SkullFire Press</div>
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

          <div className="mt-2">
            <div className="text-lg font-extrabold leading-tight line-clamp-3">
              {title}
            </div>
            <div className="mt-2 text-sm text-white/70 line-clamp-2">
              {author}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="text-xs text-white/50">ID: {seed}</div>
            <div className="text-3xl">☠️🔥</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookTile({ book, onPick }) {
  return (
    <button
      onClick={() => onPick(book)}
      className="group w-full text-left transition active:scale-[0.99]"
    >
      <div className="relative">
        <div className="pointer-events-none absolute -inset-10 opacity-0 blur-3xl transition group-hover:opacity-30">
          <div className="h-44 w-44 rounded-full bg-red-600/40" />
          <div className="mt-10 h-44 w-44 rounded-full bg-orange-500/30" />
        </div>

        <BookCover
          title={book.title}
          author={book.author}
          seed={book._id || book.id}
          available={!!book.available}
        />

        <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-4 group-hover:border-red-500/35 group-hover:bg-black/55">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-base font-extrabold">{book.title}</div>
              <div className="mt-1 text-sm text-white/70 truncate">
                by {book.author}
              </div>
            </div>

            <div className="shrink-0 rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs text-white/70">
              <div className="font-bold text-white">
                {Number(book.pages || 0) || "—"} pages
              </div>
              <div className="mt-1">{book.available ? "Ready" : "Taken"}</div>
            </div>
          </div>

          {(book.tags?.length || 0) > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {book.tags.slice(0, 4).map((t) => (
                <Pill key={t}>{t}</Pill>
              ))}
            </div>
          ) : null}

          <div className="mt-4 text-right text-xs text-white/60 group-hover:text-white/80">
            Focus book →
          </div>
        </div>
      </div>
    </button>
  );
}

export default function Day24BookshelfPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, user } = useAuthCheck();

  const shelfId = searchParams.get("shelfId") || "unknown";
  const shelfTitle = searchParams.get("title") || "Bookshelf";

  const [query, setQuery] = useState("");

  // ✅ REAL DATA from backend
  const [shelf, setShelf] = useState(null);
  const [books, setBooks] = useState([]);
  const [loadingShelf, setLoadingShelf] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("[Day24BookshelfPage] loaded");
    console.log("[Day24BookshelfPage] shelfId:", shelfId);
    console.log("[Day24BookshelfPage] shelfTitle:", shelfTitle);
  }, [shelfId, shelfTitle]);

  // ✅ Load this shelf + its books from DB
  useEffect(() => {
    let alive = true;

    const loadShelfAndBooks = async () => {
      try {
        setLoadingShelf(true);
        setError("");

        if (!shelfId || shelfId === "unknown") {
          setError("Missing shelfId. Go back and open a shelf again.");
          setBooks([]);
          setShelf(null);
          return;
        }

        console.log("➡️ [Day24BookshelfPage] GET /web/api/day24/shelves/:shelfId/books", shelfId);
        const res = await callBackend.get(`/web/api/day24/shelves/${shelfId}/books`);
        console.log("✅ [Day24BookshelfPage] shelf+books:", res?.data);

        if (!alive) return;

        setShelf(res?.data?.shelf || null);
        setBooks(Array.isArray(res?.data?.books) ? res.data.books : []);
      } catch (err) {
        console.log(
          "❌ [Day24BookshelfPage] load shelf+books failed:",
          err?.response?.data || err?.message || err
        );
        if (!alive) return;

        setShelf(null);
        setBooks([]);
        setError(err?.response?.data?.message || "Failed to load shelf books");
      } finally {
        if (!alive) return;
        setLoadingShelf(false);
      }
    };

    loadShelfAndBooks();

    return () => {
      alive = false;
    };
  }, [shelfId]);

  const shelfMeta = useMemo(() => {
    const key = String(shelf?.shelfKey || "").toLowerCase();

    const map = {
      "sci-fi": { icon: "🛸", subtitle: "Space, AI, future worlds, and strange tech." },
      fiction: { icon: "📖", subtitle: "Stories that hit hard—plots, characters, mystery." },
      facts: { icon: "🧠", subtitle: "Real-world knowledge—science, history, business." },
      adventure: { icon: "🗺️", subtitle: "Journeys, treasure, missions, survival stories." },
      famous: { icon: "🏛️", subtitle: "Public favorites—popular, iconic, recommended." },
      terror: { icon: "🕯️", subtitle: "Horror, suspense, thrillers, dark stories." },
    };

    return map[key] || { icon: shelf?.icon || "📚", subtitle: "Browse books in this category." };
  }, [shelf]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;

    return books.filter((b) => {
      const hay = `${b.title} ${b.author} ${b.description || ""} ${(b.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, books]);

  const onBack = () => {
    console.log("➡️ [Day24BookshelfPage] back clicked");
    router.push("/dashboard/day24/bookstore");
  };

  const onPickBook = (book) => {
    console.log("➡️ [Day24BookshelfPage] book picked:", book);

    const qp = new URLSearchParams();
    qp.set("shelfId", shelfId);
    qp.set("shelfTitle", shelf?.title || shelfTitle);
    qp.set("bookId", book._id || book.id);
    qp.set("title", book.title || "");
    qp.set("author", book.author || "");
    qp.set("pages", String(book.pages || 0));
    qp.set("available", String(!!book.available));

    // If you already store URLs in DB:
    if (book.downloadUrl) qp.set("downloadUrl", book.downloadUrl);
    if (book.readUrl) qp.set("readUrl", book.readUrl);

    router.push(`/dashboard/day24/bookstore/bookshelf/book?${qp.toString()}`);
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
      <div className="pointer-events-none fixed inset-0 opacity-25 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.14),transparent_55%),radial-gradient(circle_at_bottom,rgba(255,140,0,0.12),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl">
        <Header
          title={`Shelf: ${shelf?.title || shelfTitle}`}
          subtitle={shelfMeta.subtitle}
          shelfIcon={shelfMeta.icon}
          onBack={onBack}
        />

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-white/70">
            Signed in as{" "}
            <span className="font-bold text-white">{user?.email || "unknown@email"}</span>
          </div>

          <input
            value={query}
            onChange={(e) => {
              console.log("[Day24BookshelfPage] search:", e.target.value);
              setQuery(e.target.value);
            }}
            placeholder={`Search ${(shelf?.title || shelfTitle) || "shelf"} books...`}
            className="w-full md:w-[420px] rounded-xl bg-white text-black px-4 py-2"
          />
        </div>

        {/* ✅ Loading / Error / Books */}
        <div className="mt-6">
          {loadingShelf ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-white/70">
              Loading books from MongoDB…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/30 bg-black/60 p-6 text-white/80">
              ❌ {error}
              <button
                onClick={() => window.location.reload()}
                className="ml-3 underline text-white/90"
              >
                Reload
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((b) => (
                  <BookTile key={b._id || b.id} book={b} onPick={onPickBook} />
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-6 text-white/70">
                  No books found in this shelf yet.
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="mt-6 text-xs text-white/50">
          Wired endpoint:{" "}
          <span className="text-white/70">
            GET /web/api/day24/shelves/:shelfId/books
          </span>
        </div>
      </div>
    </div>
  );
}