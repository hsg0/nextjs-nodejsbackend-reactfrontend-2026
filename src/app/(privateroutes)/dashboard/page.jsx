// src/app/(privateroutes)/dashboard/page.jsx
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const days = useMemo(() => {
    const start = 1;
    const end = 365;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, []);

  const goToDay = (dayNumber) => {
    const path = `/dashboard/day${dayNumber}`; // ✅ NO (privateroutes) in URL
    console.log("✅ Dashboard goToDay:", dayNumber, "->", path);
    router.push(path);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Pick a day to open its page (Day 1 → Day 365).
        </p>
      </div>

      <div className="rounded-2xl bg-white/[0.05] ring-1 ring-white/10 p-4 sm:p-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => goToDay(day)}
              className="rounded-xl bg-white/10 ring-1 ring-white/10 px-3 py-3 text-sm font-semibold text-white hover:bg-white/15 transition active:scale-[0.98]"
            >
              Day {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}