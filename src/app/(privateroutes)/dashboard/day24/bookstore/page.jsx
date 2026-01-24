// src/app/(privateroutes)/dashboard/day24/bookstore/page.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthCheck from "@/checkAuth/authCheck.js";
import callBackend from "@/lib/callBackend.js";

/**
 * ✅ WIRED TO BACKEND
 *
 * Uses these endpoints:
 * - GET    /web/api/day24/shelves                -> listAllShelvesController
 * - POST   /web/api/day24/books                  -> addBookController
 *
 * Extra helper endpoints (recommended):
 * - POST   /web/api/day24/shelves/seed           -> seedDefaultShelvesController
 * - POST   /web/api/day24/shelves                -> createShelfController
 */

function SkullHeader({ title, subtitle }) {
  return (
    <div className="rounded-2xl border border-red-600/25 bg-zinc-950 p-6 shadow-[0_0_0_1px_rgba(255,0,0,0.08),0_20px_60px_rgba(0,0,0,0.6)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/70">{subtitle}</p>
        </div>
        <div className="text-3xl md:text-4xl">📚</div>
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

function FakeBookSpine({ index, label }) {
  const widths = ["w-6", "w-7", "w-8", "w-9"];
  const heights = ["h-16", "h-18", "h-20", "h-24"];
  const w = widths[index % widths.length];
  const h = heights[index % heights.length];

  return (
    <div
      className={`relative ${w} ${h} rounded-md border border-white/10 bg-zinc-900/80 overflow-hidden`}
      title={label}
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.22),transparent_60%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.10),transparent)]" />
      <div className="absolute inset-y-0 left-0 w-[2px] bg-white/10" />
      <div className="absolute bottom-1 left-1 right-1 text-[9px] text-white/70 truncate">
        {label}
      </div>
    </div>
  );
}

function ShelfVisual({ shelf, previewBooks = [] }) {
  const bookLabels = previewBooks.length
    ? previewBooks.map((b) => b.title || "Book")
    : (shelf?.tags || []).length
    ? shelf.tags.slice(0, 8)
    : ["Book", "Book", "Book", "Book", "Book", "Book", "Book", "Book"];

  return (
    <div className="relative mt-4 rounded-xl border border-white/10 bg-black/40 p-4 overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
      <div className="relative flex items-end gap-2">
        {bookLabels.slice(0, 8).map((label, i) => (
          <FakeBookSpine key={`${label}-${i}`} index={i} label={label} />
        ))}
        <div className="ml-auto text-xs text-white/60">
          {previewBooks.length ? "Preview" : "Shelf vibe"}
        </div>
      </div>

      <div className="relative mt-3 h-2 rounded-full border border-white/10 bg-zinc-950/80">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,rgba(255,140,0,0.18),transparent_70%)]" />
      </div>
    </div>
  );
}

function ShelfCard({ shelf, onClick }) {
  const countLabel =
    typeof shelf.bookCount === "number" ? `${shelf.bookCount} books` : "—";

  return (
    <button
      onClick={() => onClick(shelf)}
      className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 text-left transition hover:border-red-500/40 hover:bg-black/55 active:scale-[0.99]"
    >
      <div className="pointer-events-none absolute -inset-12 opacity-0 blur-3xl transition group-hover:opacity-30">
        <div className="h-40 w-40 rounded-full bg-red-600/40" />
        <div className="mt-10 h-40 w-40 rounded-full bg-orange-500/30" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-xl">{shelf.icon || "📚"}</div>
              <div className="truncate text-lg font-extrabold tracking-wide">
                {shelf.title}
              </div>
            </div>

            <div className="mt-2 text-sm text-white/70 line-clamp-2">
              {shelf.description || "No description yet."}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(shelf.tags || []).slice(0, 8).map((t) => (
                <Pill key={t}>{t}</Pill>
              ))}
            </div>
          </div>

          <div className="shrink-0">
            <div className="rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs text-white/70">
              <div className="font-bold text-white">{countLabel}</div>
              <div className="mt-1">in shelf</div>
            </div>

            <div className="mt-3 text-right text-white/60 text-xs group-hover:text-white/80">
              Enter shelf →
            </div>
          </div>
        </div>

        <ShelfVisual shelf={shelf} previewBooks={shelf.previewBooks || []} />
      </div>
    </button>
  );
}

function FieldLabel({ children }) {
  return (
    <div className="text-[11px] tracking-wide text-white/60 mb-1">{children}</div>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl bg-white text-black px-4 py-2 ${props.className || ""}`}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl bg-white text-black px-4 py-2 min-h-[92px] ${props.className || ""}`}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl bg-white text-black px-4 py-2 ${props.className || ""}`}
    />
  );
}

function NoteBox({ children, tone = "neutral" }) {
  const cls =
    tone === "danger"
      ? "border-red-500/30 bg-black/60"
      : tone === "success"
      ? "border-white/10 bg-zinc-950/70"
      : "border-white/10 bg-black/40";

  return (
    <div className={`rounded-xl border ${cls} p-4 text-sm text-white/80`}>
      {children}
    </div>
  );
}

export default function Day24BookstorePage() {
  const router = useRouter();
  const { loading, user } = useAuthCheck();

  const [query, setQuery] = useState("");

  // ✅ Shelves from DB (real)
  const [shelves, setShelves] = useState([]);
  const [shelvesLoading, setShelvesLoading] = useState(true);
  const [shelvesError, setShelvesError] = useState("");

  // ✅ Add Book Drawer
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  // ✅ Seed / Create shelf helpers
  const [seeding, setSeeding] = useState(false);
  const [createShelfOpen, setCreateShelfOpen] = useState(false);
  const [creatingShelf, setCreatingShelf] = useState(false);

  const [shelfForm, setShelfForm] = useState({
    title: "",
    shelfKey: "",
    icon: "📚",
    description: "",
    tagsCsv: "",
  });

  // ✅ Add book form
  const [form, setForm] = useState({
    shelfId: "",
    title: "",
    author: "",
    isbn: "",
    pages: "",
    tagsCsv: "",
    description: "",
    bookCoverImageUrl: "",
    downloadUrl: "",
    readUrl: "",
  });

  useEffect(() => {
    console.log("[Day24BookstorePage] loaded");
  }, []);

  const loadShelves = async () => {
    try {
      setShelvesLoading(true);
      setShelvesError("");

      console.log("➡️ [Day24BookstorePage] GET /web/api/day24/shelves");
      const res = await callBackend.get("/web/api/day24/shelves");
      const apiShelves = res?.data?.shelves || [];
      console.log("✅ [Day24BookstorePage] shelves from API:", apiShelves);

      setShelves(apiShelves);

      // auto-select first shelf in form
      if (!form.shelfId && apiShelves?.[0]?._id) {
        console.log("✅ [Day24BookstorePage] auto-select shelfId:", apiShelves[0]._id);
        setForm((p) => ({ ...p, shelfId: apiShelves[0]._id }));
      }
    } catch (err) {
      console.log(
        "❌ [Day24BookstorePage] load shelves failed:",
        err?.response?.data || err?.message || err
      );
      setShelves([]);
      setShelvesError(err?.response?.data?.message || "Failed to load shelves");
    } finally {
      setShelvesLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await loadShelves();
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredShelves = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shelves;
    return shelves.filter((s) => {
      const hay = `${s.title} ${s.description} ${(s.tags || []).join(" ")} ${s.shelfKey || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, shelves]);

  const onToggleAdd = () => {
    console.log("➡️ [Day24BookstorePage] toggle add drawer:", !addOpen);
    setAddOpen((v) => !v);
    setNote("");
  };

  const onChange = (k, v) => {
    console.log("[Day24BookstorePage] form change:", k, v);
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const onSubmitAdd = async (e) => {
    e.preventDefault();
    setNote("");

    console.log("➡️ [Day24BookstorePage] submit add book:", form);

    if (!form.shelfId || !form.title || !form.author) {
      setNote("❌ Please fill: shelf + title + author (required).");
      return;
    }

    setSaving(true);

    try {
      const tags = String(form.tagsCsv || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      console.log("➡️ [Day24BookstorePage] POST /web/api/day24/books payload building...");

      const payload = {
        shelfId: form.shelfId,
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        description: form.description,
        pages: form.pages,
        tags,
        downloadUrl: form.downloadUrl,
        readUrl: form.readUrl,
        bookCoverImageUrl: form.bookCoverImageUrl,
      };

      console.log("➡️ [Day24BookstorePage] POST /web/api/day24/books payload:", payload);

      const res = await callBackend.post("/web/api/day24/books", payload);
      console.log("✅ [Day24BookstorePage] addBook success:", res?.data);

      setNote("✅ Book added to DB! Reloading shelves counts...");
      await loadShelves();

      setForm((p) => ({
        ...p,
        title: "",
        author: "",
        isbn: "",
        pages: "",
        tagsCsv: "",
        description: "",
        bookCoverImageUrl: "",
        downloadUrl: "",
        readUrl: "",
      }));

      setAddOpen(false);
    } catch (err) {
      console.log("❌ [Day24BookstorePage] add book failed:", err?.response?.data || err?.message || err);
      setNote(err?.response?.data?.message || "❌ Failed to add book.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenShelf = (shelf) => {
    console.log("➡️ [Day24BookstorePage] shelf clicked:", shelf);

    const qp = new URLSearchParams();
    qp.set("shelfId", shelf._id || "unknown");
    qp.set("title", shelf.title || "Shelf");
    router.push(`/dashboard/day24/bookstore/bookshelf?${qp.toString()}`);
  };

  const onSeedShelves = async () => {
    setNote("");
    setSeeding(true);
    try {
      console.log("➡️ [Day24BookstorePage] POST /web/api/day24/shelves/seed");
      const res = await callBackend.post("/web/api/day24/shelves/seed");
      console.log("✅ [Day24BookstorePage] seed shelves success:", res?.data);

      setNote("✅ Default shelves created! Reloading...");
      await loadShelves();
    } catch (err) {
      console.log("❌ [Day24BookstorePage] seed shelves failed:", err?.response?.data || err?.message || err);
      setNote(err?.response?.data?.message || "❌ Failed to seed shelves.");
    } finally {
      setSeeding(false);
    }
  };

  const onCreateShelf = async (e) => {
    e.preventDefault();
    setNote("");

    const title = String(shelfForm.title || "").trim();
    const shelfKey = String(shelfForm.shelfKey || "").trim().toLowerCase();

    console.log("➡️ [Day24BookstorePage] create shelf submit:", shelfForm);

    if (!title || !shelfKey) {
      setNote("❌ Please fill: shelf title + shelfKey (required).");
      return;
    }

    setCreatingShelf(true);

    try {
      const tags = String(shelfForm.tagsCsv || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title,
        shelfKey,
        icon: shelfForm.icon || "📚",
        description: shelfForm.description || "",
        tags,
      };

      console.log("➡️ [Day24BookstorePage] POST /web/api/day24/shelves payload:", payload);

      const res = await callBackend.post("/web/api/day24/shelves", payload);
      console.log("✅ [Day24BookstorePage] create shelf success:", res?.data);

      setNote("✅ Shelf created! Reloading shelves...");
      await loadShelves();

      setShelfForm({
        title: "",
        shelfKey: "",
        icon: "📚",
        description: "",
        tagsCsv: "",
      });

      setCreateShelfOpen(false);
    } catch (err) {
      console.log("❌ [Day24BookstorePage] create shelf failed:", err?.response?.data || err?.message || err);
      setNote(err?.response?.data?.message || "❌ Failed to create shelf.");
    } finally {
      setCreatingShelf(false);
    }
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
        <SkullHeader
          title="SkullFire Bookstore"
          subtitle="Backend wired: shelves load from MongoDB, and Add Book saves to DB."
        />

        {/* ✅ Add Book Drawer (WIRED) */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
          <button
            onClick={onToggleAdd}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-black/55 transition"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">➕</div>
              <div className="text-left">
                <div className="font-extrabold text-lg">Add a New Book</div>
                <div className="text-sm text-white/70">
                  Saved to MongoDB via{" "}
                  <span className="text-white/90 font-bold">
                    POST /web/api/day24/books
                  </span>
                </div>
              </div>
            </div>
            <div className="text-white/70 font-bold">{addOpen ? "Close ▲" : "Open ▼"}</div>
          </button>

          {addOpen ? (
            <div className="px-5 pb-5">
              <div className="h-px bg-white/10 mb-5" />

              {/* shelves load state */}
              {shelvesLoading ? (
                <NoteBox>Loading shelves so you can choose a category…</NoteBox>
              ) : shelvesError ? (
                <NoteBox tone="danger">
                  ❌ {shelvesError}{" "}
                  <button onClick={() => loadShelves()} className="ml-2 underline text-white/90">
                    Retry
                  </button>
                </NoteBox>
              ) : shelves.length === 0 ? (
                <div className="grid gap-3">
                  <NoteBox tone="danger">
                    ❌ No shelves found in DB. Create shelves first or seed defaults.
                  </NoteBox>

                  <div className="flex flex-col md:flex-row gap-3">
                    <button
                      onClick={onSeedShelves}
                      disabled={seeding}
                      className="rounded-2xl px-6 py-3 font-extrabold bg-gradient-to-r from-red-600 to-orange-500 text-black hover:brightness-110 active:scale-[0.99] disabled:opacity-40"
                    >
                      {seeding ? "Seeding..." : "Seed Default Shelves"}
                    </button>

                    <button
                      onClick={() => setCreateShelfOpen((v) => !v)}
                      className="rounded-2xl px-6 py-3 font-extrabold border border-white/10 bg-black/40 text-white hover:bg-black/60 hover:border-white/20 active:scale-[0.99]"
                    >
                      {createShelfOpen ? "Close Create Shelf" : "Create One Shelf"}
                    </button>
                  </div>

                  {createShelfOpen ? (
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <div className="text-sm font-extrabold">Create Shelf (category)</div>
                      <div className="text-xs text-white/60 mt-1">
                        Uses <span className="text-white/80 font-bold">POST /web/api/day24/shelves</span>
                      </div>

                      <form onSubmit={onCreateShelf} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>Title (required)</FieldLabel>
                          <TextInput
                            value={shelfForm.title}
                            onChange={(e) => setShelfForm((p) => ({ ...p, title: e.target.value }))}
                            placeholder="e.g., Philosophy"
                          />
                        </div>

                        <div>
                          <FieldLabel>Shelf Key (required)</FieldLabel>
                          <TextInput
                            value={shelfForm.shelfKey}
                            onChange={(e) => setShelfForm((p) => ({ ...p, shelfKey: e.target.value }))}
                            placeholder="e.g., philosophy"
                          />
                        </div>

                        <div>
                          <FieldLabel>Icon</FieldLabel>
                          <TextInput
                            value={shelfForm.icon}
                            onChange={(e) => setShelfForm((p) => ({ ...p, icon: e.target.value }))}
                            placeholder="📚"
                          />
                        </div>

                        <div>
                          <FieldLabel>Tags (comma separated)</FieldLabel>
                          <TextInput
                            value={shelfForm.tagsCsv}
                            onChange={(e) => setShelfForm((p) => ({ ...p, tagsCsv: e.target.value }))}
                            placeholder="stoicism, ethics, logic"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <FieldLabel>Description</FieldLabel>
                          <TextArea
                            value={shelfForm.description}
                            onChange={(e) => setShelfForm((p) => ({ ...p, description: e.target.value }))}
                            placeholder="What belongs on this shelf?"
                          />
                        </div>

                        <div className="md:col-span-2 flex items-center justify-between gap-3">
                          <div className="text-xs text-white/60">
                            Signed in as{" "}
                            <span className="font-bold text-white">{user?.email || "unknown@email"}</span>
                          </div>

                          <button
                            type="submit"
                            disabled={creatingShelf}
                            className="rounded-2xl px-6 py-3 font-extrabold bg-gradient-to-r from-red-600 to-orange-500 text-black hover:brightness-110 active:scale-[0.99] disabled:opacity-40"
                          >
                            {creatingShelf ? "Creating..." : "Create Shelf"}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : null}

                  {note ? <NoteBox tone="neutral">{note}</NoteBox> : null}
                </div>
              ) : (
                <>
                  {/* quick helpers even when shelves exist */}
                  <div className="flex flex-col md:flex-row gap-3 mb-4">
                    <button
                      onClick={onSeedShelves}
                      disabled={seeding}
                      className="rounded-2xl px-6 py-3 font-extrabold border border-white/10 bg-black/40 text-white hover:bg-black/60 hover:border-white/20 active:scale-[0.99] disabled:opacity-40"
                    >
                      {seeding ? "Seeding..." : "Seed Defaults (safe upsert)"}
                    </button>

                    <button
                      onClick={() => setCreateShelfOpen((v) => !v)}
                      className="rounded-2xl px-6 py-3 font-extrabold border border-white/10 bg-black/40 text-white hover:bg-black/60 hover:border-white/20 active:scale-[0.99]"
                    >
                      {createShelfOpen ? "Close Create Shelf" : "Create Shelf"}
                    </button>
                  </div>

                  {createShelfOpen ? (
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 mb-4">
                      <div className="text-sm font-extrabold">Create Shelf (category)</div>
                      <div className="text-xs text-white/60 mt-1">
                        Uses <span className="text-white/80 font-bold">POST /web/api/day24/shelves</span>
                      </div>

                      <form onSubmit={onCreateShelf} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>Title (required)</FieldLabel>
                          <TextInput
                            value={shelfForm.title}
                            onChange={(e) => setShelfForm((p) => ({ ...p, title: e.target.value }))}
                            placeholder="e.g., Philosophy"
                          />
                        </div>

                        <div>
                          <FieldLabel>Shelf Key (required)</FieldLabel>
                          <TextInput
                            value={shelfForm.shelfKey}
                            onChange={(e) => setShelfForm((p) => ({ ...p, shelfKey: e.target.value }))}
                            placeholder="e.g., philosophy"
                          />
                        </div>

                        <div>
                          <FieldLabel>Icon</FieldLabel>
                          <TextInput
                            value={shelfForm.icon}
                            onChange={(e) => setShelfForm((p) => ({ ...p, icon: e.target.value }))}
                            placeholder="📚"
                          />
                        </div>

                        <div>
                          <FieldLabel>Tags (comma separated)</FieldLabel>
                          <TextInput
                            value={shelfForm.tagsCsv}
                            onChange={(e) => setShelfForm((p) => ({ ...p, tagsCsv: e.target.value }))}
                            placeholder="stoicism, ethics, logic"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <FieldLabel>Description</FieldLabel>
                          <TextArea
                            value={shelfForm.description}
                            onChange={(e) => setShelfForm((p) => ({ ...p, description: e.target.value }))}
                            placeholder="What belongs on this shelf?"
                          />
                        </div>

                        <div className="md:col-span-2 flex items-center justify-between gap-3">
                          <div className="text-xs text-white/60">
                            Signed in as{" "}
                            <span className="font-bold text-white">{user?.email || "unknown@email"}</span>
                          </div>

                          <button
                            type="submit"
                            disabled={creatingShelf}
                            className="rounded-2xl px-6 py-3 font-extrabold bg-gradient-to-r from-red-600 to-orange-500 text-black hover:brightness-110 active:scale-[0.99] disabled:opacity-40"
                          >
                            {creatingShelf ? "Creating..." : "Create Shelf"}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : null}

                  {/* ✅ Add book form */}
                  <form onSubmit={onSubmitAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Bookshelf Category (required)</FieldLabel>
                      <Select
                        value={form.shelfId}
                        onChange={(e) => onChange("shelfId", e.target.value)}
                      >
                        {shelves.map((s) => (
                          <option key={s._id} value={s._id}>
                            {(s.icon || "📚") + " " + (s.title || "Shelf")}
                          </option>
                        ))}
                      </Select>
                      <div className="mt-2 text-[11px] text-white/50">
                        Uses <span className="text-white/70 font-bold">shelfId</span> (Mongo ObjectId) so the book lands in the correct shelf.
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Pages (optional)</FieldLabel>
                      <TextInput
                        value={form.pages}
                        onChange={(e) => onChange("pages", e.target.value)}
                        placeholder="e.g., 320"
                        inputMode="numeric"
                      />
                    </div>

                    <div>
                      <FieldLabel>Title (required)</FieldLabel>
                      <TextInput
                        value={form.title}
                        onChange={(e) => onChange("title", e.target.value)}
                        placeholder="e.g., Neon Sanctuary"
                      />
                    </div>

                    <div>
                      <FieldLabel>Author (required)</FieldLabel>
                      <TextInput
                        value={form.author}
                        onChange={(e) => onChange("author", e.target.value)}
                        placeholder="e.g., D. Kross"
                      />
                    </div>

                    <div>
                      <FieldLabel>ISBN (optional)</FieldLabel>
                      <TextInput
                        value={form.isbn}
                        onChange={(e) => onChange("isbn", e.target.value)}
                        placeholder="978-1234567890"
                      />
                    </div>

                    <div>
                      <FieldLabel>Tags (comma separated)</FieldLabel>
                      <TextInput
                        value={form.tagsCsv}
                        onChange={(e) => onChange("tagsCsv", e.target.value)}
                        placeholder="space, AI, cyberpunk"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <FieldLabel>Description (optional)</FieldLabel>
                      <TextArea
                        value={form.description}
                        onChange={(e) => onChange("description", e.target.value)}
                        placeholder="Short summary..."
                      />
                    </div>

                    <div>
                      <FieldLabel>Cover Image URL (optional)</FieldLabel>
                      <TextInput
                        value={form.bookCoverImageUrl}
                        onChange={(e) => onChange("bookCoverImageUrl", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <FieldLabel>Download URL (optional)</FieldLabel>
                      <TextInput
                        value={form.downloadUrl}
                        onChange={(e) => onChange("downloadUrl", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <FieldLabel>Read URL (optional)</FieldLabel>
                      <TextInput
                        value={form.readUrl}
                        onChange={(e) => onChange("readUrl", e.target.value)}
                        placeholder="https://... (reader link)"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="text-xs text-white/60">
                        Signed in as{" "}
                        <span className="font-bold text-white">{user?.email || "unknown@email"}</span>
                      </div>

                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-2xl px-6 py-3 font-extrabold bg-gradient-to-r from-red-600 to-orange-500 text-black hover:brightness-110 active:scale-[0.99] disabled:opacity-40"
                      >
                        {saving ? "Saving..." : "Add Book to DB"}
                      </button>
                    </div>

                    {note ? (
                      <div className="md:col-span-2">
                        <NoteBox tone={note.startsWith("✅") ? "success" : "danger"}>
                          {note}
                        </NoteBox>
                      </div>
                    ) : null}
                  </form>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* Search bar */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-white/70">
            Signed in as{" "}
            <span className="font-bold text-white">{user?.email || "unknown@email"}</span>
          </div>

          <TextInput
            value={query}
            onChange={(e) => {
              console.log("[Day24BookstorePage] search:", e.target.value);
              setQuery(e.target.value);
            }}
            placeholder="Search shelves (e.g., sci-fi, horror, history...)"
            className="md:w-[420px]"
          />
        </div>

        {/* Shelves grid */}
        <div className="mt-6">
          {shelvesLoading ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-white/70">
              Loading shelves from MongoDB…
            </div>
          ) : shelvesError ? (
            <div className="rounded-2xl border border-red-500/30 bg-black/60 p-6 text-white/80">
              ❌ {shelvesError}
              <button onClick={() => loadShelves()} className="ml-3 underline text-white/90">
                Retry
              </button>
            </div>
          ) : shelves.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-white/70">
              No shelves yet. Open “Add a New Book” and seed defaults or create a shelf.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredShelves.map((s) => (
                <ShelfCard key={s._id} shelf={s} onClick={handleOpenShelf} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-white/50">
          Wired endpoints:{" "}
          <span className="text-white/70">
            GET /web/api/day24/shelves • POST /web/api/day24/books
          </span>{" "}
          <span className="text-white/50">
            • (optional) POST /web/api/day24/shelves • POST /web/api/day24/shelves/seed
          </span>
        </div>
      </div>
    </div>
  );
}