"use client";

import React, { useEffect, useRef, useState } from "react";
import callBackend from "@/lib/callBackend"; // ✅ axios instance

function SkullFireIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M34 6c2 6-2 10-6 14-5 5-6 10-4 16 2 8 10 12 18 10 9-2 15-10 14-19-1-9-8-15-13-21 1 6-2 9-9 10z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 37c0-9 7-16 16-16s16 7 16 16c0 6-3 11-8 14v6c0 2-2 4-4 4H28c-2 0-4-2-4-4v-6c-5-3-8-8-8-14z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M26 39c0 2-1 3-3 3s-3-1-3-3 1-3 3-3 3 1 3 3zm18 0c0 2-1 3-3 3s-3-1-3-3 1-3 3-3 3 1 3 3z"
        fill="currentColor"
      />
      <path
        d="M24 50h16M28 50v6M36 50v6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function Day76Page() {
  const [open, setOpen] = useState(false);

  // Chat
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // URL
  const [ingestUrl, setIngestUrl] = useState("https://example.com");
  const [ingesting, setIngesting] = useState(false);

  // ✅ Optional: show a tiny debug line (no URLs)
  const [showMeta, setShowMeta] = useState(true);

  const [messages, setMessages] = useState([
    {
      id: makeId(),
      role: "assistant",
      text:
        "🔥 SkullFire RAG is online.\n" +
        "Put a URL in the top box.\n" +
        "Send will auto-ingest (if needed) then answer from sources.",
    },
  ]);

  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    try {
      if (!listRef.current) return;
      // ✅ Correct scroll for a div
      listRef.current.scrollTop = listRef.current.scrollHeight;
    } catch (e) {
      console.log("⚠️ scroll error:", e);
    }
  }, [messages, open]);

  const toggle = () => {
    console.log("🟠 toggle chat:", !open);
    setOpen((v) => !v);
  };

  // Optional manual ingest (force refresh)
  const doIngest = async () => {
    const url = ingestUrl.trim();
    if (!url || ingesting) return;

    console.log("🕷️ manual ingest:", url);
    setIngesting(true);

    const statusId = makeId();
    setMessages((prev) => [
      ...prev,
      {
        id: statusId,
        role: "assistant",
        text: `🕷️ Ingesting: ${url}\n…scraping + embedding…`,
      },
    ]);

    try {
      const res = await callBackend.post("/web/api/dayAI76/rag/ingest-url", { url });
      console.log("🟢 ingest response:", res.status, res.data);

      const ok = res.data?.ok;
      const saved = res.data?.saved ?? 0;
      const title = res.data?.title || "";

      const msg = ok
        ? `✅ Ingest complete\nSaved chunks: ${saved}\nTitle: ${title || "(no title)"}`
        : `❌ Ingest failed for ${url}`;

      setMessages((prev) => prev.map((m) => (m.id === statusId ? { ...m, text: msg } : m)));
    } catch (err) {
      console.error("❌ ingest error:", err?.response?.data || err);

      const msg = err?.response?.data?.message || "❌ Ingest failed. Check backend logs.";
      setMessages((prev) => prev.map((m) => (m.id === statusId ? { ...m, text: msg } : m)));
    } finally {
      setIngesting(false);
    }
  };

  // ✅ Send = auto-rag (backend does ingest(if needed) -> search -> answer)
  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    console.log("🟣 send:", text);

    setInput("");
    setSending(true);

    const userId = makeId();
    const placeholderId = makeId();

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", text },
      { id: placeholderId, role: "assistant", text: "…thinking…" },
    ]);

    try {
      const url = ingestUrl.trim();
      const body = url ? { message: text, url } : { message: text };

      console.log("🟣 calling /web/api/dayAI76/rag/ask-auto with:", body);

      const res = await callBackend.post("/web/api/dayAI76/rag/ask-auto", body);
      console.log("🟢 rag response:", res.status, res.data);

      const answer = String(res.data?.answer || "").trim() || "❌ No answer returned.";
      const sources = Array.isArray(res.data?.sources) ? res.data.sources : [];
      const mode = res.data?.mode || "";
      const topScore = typeof res.data?.topScore === "number" ? res.data.topScore : null;
      const usedWeb = typeof res.data?.usedWeb === "boolean" ? res.data.usedWeb : null;

      // ✅ DO NOT append URLs. Only show answer (and optional tiny meta line).
      let finalText = answer;

      if (showMeta) {
        const metaBits = [];
        metaBits.push(`Sources: ${sources.length}`);
        if (mode) metaBits.push(`Mode: ${mode}`);
        if (usedWeb !== null) metaBits.push(`UsedWeb: ${usedWeb}`);
        if (topScore !== null) metaBits.push(`TopScore: ${topScore.toFixed(3)}`);

        finalText += `\n\n—\n${metaBits.join(" | ")}`;
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === placeholderId ? { ...m, text: finalText } : m))
      );
    } catch (backendError) {
      console.error(
        "❌ backend error:",
        backendError?.response?.status,
        backendError?.response?.data || backendError
      );

      const errMsg =
        backendError?.response?.data?.message || "❌ Backend/LLM error. Check server logs.";

      setMessages((prev) => prev.map((m) => (m.id === placeholderId ? { ...m, text: errMsg } : m)));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("🟣 enter -> send");
      send();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-extrabold">Day 76 — Local LLM + RAG</h1>
        <p className="mt-2 text-white/60">Click the skull 🔥 in the bottom-right to chat.</p>
      </div>

      {/* Floating icon */}
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-5 right-5 z-[9999] group"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <div className="relative">
          <div className="absolute -inset-1 rounded-full blur-lg opacity-70 group-hover:opacity-90 transition bg-gradient-to-r from-orange-500 via-red-500 to-amber-400" />
          <div className="relative w-14 h-14 rounded-full bg-zinc-950 ring-1 ring-white/10 shadow-2xl flex items-center justify-center">
            <SkullFireIcon className="w-7 h-7 text-orange-400 group-hover:text-orange-300 transition" />
          </div>
        </div>
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[9999] w-[92vw] max-w-[460px]">
          <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-zinc-950">
            {/* header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950">
              <div className="flex items-center gap-2">
                <SkullFireIcon className="w-5 h-5 text-orange-400" />
                <div>
                  <div className="text-sm font-bold text-white">SkullFire RAG</div>
                  <div className="text-[12px] text-white/60">MongoDB Atlas Vector Search + llama.cpp</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* ✅ tiny toggle for meta */}
                <button
                  type="button"
                  onClick={() => setShowMeta((v) => !v)}
                  className="text-white/70 hover:text-white text-[12px] px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10"
                >
                  Meta: {showMeta ? "ON" : "OFF"}
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-white/70 hover:text-white text-sm px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10"
                >
                  Close
                </button>
              </div>
            </div>

            {/* url bar */}
            <div className="px-3 py-3 border-b border-white/10 bg-white/[0.03]">
              <div className="text-[11px] text-white/60 mb-2">
                Send will auto-ingest this URL (if it’s not in MongoDB yet).
              </div>

              <div className="flex gap-2">
                <input
                  value={ingestUrl}
                  onChange={(e) => setIngestUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-orange-500/40"
                />
                <button
                  type="button"
                  onClick={doIngest}
                  disabled={ingesting || !ingestUrl.trim()}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition whitespace-nowrap",
                    ingesting || !ingestUrl.trim()
                      ? "bg-white/5 text-white/40 ring-white/10 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 via-red-500 to-amber-400 text-zinc-950 ring-white/10 hover:opacity-95 active:scale-[0.98]",
                  ].join(" ")}
                >
                  {ingesting ? "..." : "Ingest"}
                </button>
              </div>
            </div>

            {/* messages */}
            <div
              ref={listRef}
              className="h-[420px] max-h-[55vh] overflow-y-auto px-3 py-3 space-y-3"
            >
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={[
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ring-1 whitespace-pre-wrap break-words",
                        isUser
                          ? "bg-orange-500/10 text-orange-100 ring-orange-400/20"
                          : "bg-white/5 text-white/90 ring-white/10",
                      ].join(" ")}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* input */}
            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={2}
                  placeholder="Ask something… (Enter to send)"
                  className="w-full resize-none rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-orange-500/40"
                />

                <button
                  type="button"
                  onClick={send}
                  disabled={sending || !input.trim()}
                  className={[
                    "rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition",
                    sending || !input.trim()
                      ? "bg-white/5 text-white/40 ring-white/10 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 via-red-500 to-amber-400 text-zinc-950 ring-white/10 hover:opacity-95 active:scale-[0.98]",
                  ].join(" ")}
                >
                  {sending ? "..." : "Send"}
                </button>
              </div>

              <div className="mt-2 text-[11px] text-white/45">
                🔥 Send = auto-ingest (if needed) → RAG search → llama.cpp answer
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}