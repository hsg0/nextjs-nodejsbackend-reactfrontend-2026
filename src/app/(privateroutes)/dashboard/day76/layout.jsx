export const metadata = {
    title: "Day 76 — SkullFire RAG",
    description: "Local LLM + RAG playground (Skull-on-fire theme).",
  };
  
  export default function Day76Layout({ children }) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* subtle background glow */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -top-40 right-[-120px] h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute top-40 left-[-140px] h-[520px] w-[520px] rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute bottom-[-200px] right-20 h-[520px] w-[520px] rounded-full bg-amber-400/10 blur-3xl" />
        </div>
  
        {/* top bar */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <span className="text-lg">🔥</span>
              </span>
  
              <div>
                <div className="text-sm font-extrabold tracking-tight">
                  SkullFire Lab
                </div>
                <div className="text-[12px] text-white/60">
                  Day 76 — Local LLM + RAG
                </div>
              </div>
            </div>
  
            <div className="text-[12px] text-white/60">
              bottom-right chat →
            </div>
          </div>
        </header>
  
        {/* page content */}
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
  
        {/* footer */}
        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-5xl px-4 py-6 text-[12px] text-white/50">
            SkullFire RAG playground • Local-first • No cloud
          </div>
        </footer>
      </div>
    );
  }