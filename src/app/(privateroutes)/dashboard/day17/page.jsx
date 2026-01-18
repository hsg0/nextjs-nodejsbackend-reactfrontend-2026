"use client";

import React from "react";

function FlameDivider() {
  return (
    <div className="mt-6 flex items-center gap-3">
      <div className="h-[1px] flex-1 bg-white/10" />
      <div className="text-xs text-white/50">🔥</div>
      <div className="h-[1px] flex-1 bg-white/10" />
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl bg-white/[0.05] ring-1 ring-white/10 p-5 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
        </div>
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500/20 via-red-500/10 to-amber-400/10 ring-1 ring-white/10" />
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function Day17Page() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 ring-1 ring-white/10 p-6 shadow-2xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-white/70">
              ☠️ Skull-on-Fire Lab
              <span className="text-orange-300">•</span>
              Day 17
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
              Build a “Funky” Dark UI
            </h1>
            <p className="mt-2 text-sm text-white/60 max-w-2xl">
              Today’s goal: a wicked dashboard page with a clean flow:
              <span className="text-white/80"> pick product → generate ad → ship.</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/dashboard/day17/products"
              className="rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              Select Product
            </a>
            <a
              href="/dashboard/day17/ad-generator"
              className="rounded-xl px-4 py-2 text-sm font-extrabold text-zinc-950 ring-1 ring-white/10 transition bg-gradient-to-r from-orange-500 via-red-500 to-amber-400 hover:opacity-95 active:scale-[0.98]"
            >
              Generate Ad
            </a>
          </div>
        </div>

        <FlameDivider />

        {/* Progress bar vibe */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Day 17 Progress</span>
            <span>UI • Wiring • RAG</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-white/5 ring-1 ring-white/10 overflow-hidden">
            <div className="h-full w-[38%] bg-gradient-to-r from-orange-500 via-red-500 to-amber-400" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card
          title="1) Pick a Product"
          subtitle="Choose what you want the ad to sell."
        >
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="text-orange-300">•</span> Product name + short features
            </li>
            <li className="flex gap-2">
              <span className="text-orange-300">•</span> Target audience + tone
            </li>
            <li className="flex gap-2">
              <span className="text-orange-300">•</span> Offer + CTA
            </li>
          </ul>

          <a
            href="/dashboard/day17/products"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Go to Product Picker →
          </a>
        </Card>

        <Card
          title="2) Generate an Ad"
          subtitle="SkullFire writes copy from your inputs."
        >
          <div className="text-sm text-white/70 leading-relaxed">
            Output ideas:
            <div className="mt-2 grid grid-cols-1 gap-2">
              <div className="rounded-xl bg-black/30 ring-1 ring-white/10 p-3">
                <div className="text-xs text-white/50">Format</div>
                <div className="text-white/80">Hook + Benefit + CTA</div>
              </div>
              <div className="rounded-xl bg-black/30 ring-1 ring-white/10 p-3">
                <div className="text-xs text-white/50">Variants</div>
                <div className="text-white/80">3 tones (calm / edgy / savage)</div>
              </div>
            </div>
          </div>

          <a
            href="/dashboard/day17/ad-generator"
            className="mt-4 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-extrabold text-zinc-950 ring-1 ring-white/10 transition bg-gradient-to-r from-orange-500 via-red-500 to-amber-400 hover:opacity-95 active:scale-[0.98]"
          >
            Open Ad Generator →
          </a>
        </Card>

        <Card
          title="3) Save + Track"
          subtitle="Later we store daily progress (MongoDB Atlas)."
        >
          <div className="rounded-xl bg-black/30 ring-1 ring-white/10 p-3 text-sm text-white/70">
            <div className="text-xs text-white/50">Coming next</div>
            <div className="mt-1">
              Save:
              <span className="text-white/80"> product, prompt, generated copy, day notes</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
            <div className="text-xs text-white/50">Rule</div>
            <div className="mt-1 text-sm text-white/80">
              Keep it simple: one document per day.
            </div>
          </div>
        </Card>
      </div>

      {/* Footer note */}
      <div className="mt-8 text-xs text-white/45">
        ☠️ Theme locked: zinc-black UI, orange/red flame glow, sharp rounded cards.
      </div>
    </div>
  );
}