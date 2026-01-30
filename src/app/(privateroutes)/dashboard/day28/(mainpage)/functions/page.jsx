"use client";

// /src/app/(privateroutes)/dashboard/day28/(mainpage)/functions/page.jsx
// Day 28 - Functions Practice Lab
// Show ALL examples at once (no selection), each on white paper UI
// Fix: removed bad template-string escaping that caused "Expected unicode escape"

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthCheck from "@/checkAuth/authCheck";
import { toast } from "react-toastify";

/* ------------------ UI helpers ------------------ */

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/70">
      {children}
    </span>
  );
}

function MiniButton({ children, onClick, tone = "default" }) {
  const toneClass =
    tone === "purple"
      ? "bg-purple-600/20 text-purple-100 hover:bg-purple-600/30"
      : tone === "danger"
      ? "bg-red-500/10 text-red-100 hover:bg-red-500/20"
      : "bg-white/5 text-white/80 hover:bg-white/10";

  return (
    <button
      onClick={onClick}
      className={`rounded-xl border border-white/10 px-4 py-2 text-sm font-extrabold transition active:scale-[0.99] ${toneClass}`}
    >
      {children}
    </button>
  );
}

/* ------------------ white paper helpers ------------------ */

function Paper({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold text-zinc-900">{title}</div>
            {subtitle ? <div className="mt-1 text-xs text-zinc-600">{subtitle}</div> : null}
          </div>
          {right ? <div className="text-xs font-extrabold text-zinc-600">{right}</div> : null}
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, #000 0px, #000 1px, transparent 1px, transparent 28px)",
            }}
          />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}

function PaperCodeBlock({ code }) {
  return (
    <pre className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-900 overflow-auto">
      <code>{code}</code>
    </pre>
  );
}

function PaperOutputBox({ lines = [] }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="text-sm font-extrabold text-zinc-900">Output</div>
      <div className="mt-2 space-y-1 text-xs text-zinc-700 font-mono">
        {lines.length === 0 ? <div>—</div> : null}
        {lines.map((line, idx) => (
          <div key={`${line}-${idx}`}>{line}</div>
        ))}
      </div>
    </div>
  );
}

function PaperGlossary() {
  return (
    <Paper title="Mini glossary" subtitle="Read once, then use it while you learn.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-extrabold text-zinc-900">Parameter</div>
          <div className="mt-1 text-xs text-zinc-600">
            A placeholder name inside the function definition.
          </div>
          <div className="mt-2 text-xs text-zinc-600 font-mono">
            function example(parameterName) {"{ ... }"}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-extrabold text-zinc-900">Argument</div>
          <div className="mt-1 text-xs text-zinc-600">
            The real value you pass when calling the function.
          </div>
          <div className="mt-2 text-xs text-zinc-600 font-mono">example(argumentValue)</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-extrabold text-zinc-900">Variable</div>
          <div className="mt-1 text-xs text-zinc-600">A named container that stores a value.</div>
          <div className="mt-2 text-xs text-zinc-600 font-mono">const storedValue = 123</div>
        </div>
      </div>
    </Paper>
  );
}

/* ------------------ page ------------------ */

export default function Day28FunctionsPage() {
  const router = useRouter();
  const { loading, isAuthenticated, user } = useAuthCheck();

  const [outputLines, setOutputLines] = useState([]);

  // Inputs used by ALL examples
  const [personName, setPersonName] = useState("Sunny");
  const [firstNumberText, setFirstNumberText] = useState("5");
  const [secondNumberText, setSecondNumberText] = useState("7");
  const [temperatureCelsiusText, setTemperatureCelsiusText] = useState("20");
  const [basePriceText, setBasePriceText] = useState("100");
  const [taxRateText, setTaxRateText] = useState("0.12");

  useEffect(() => {
    console.log("[Day28FunctionsPage] mounted");
  }, []);

  useEffect(() => {
    console.log("[Day28FunctionsPage] auth state:", { loading, isAuthenticated, user });
  }, [loading, isAuthenticated, user]);

  const clearOutput = () => {
    console.log("[Day28FunctionsPage] clearOutput clicked");
    setOutputLines([]);
  };

  const toNumberOrZero = (text) => {
    const parsedNumber = Number(text);
    if (Number.isNaN(parsedNumber)) return 0;
    return parsedNumber;
  };

  const ctx = useMemo(() => {
    return {
      personName,
      firstNumberText,
      secondNumberText,
      temperatureCelsiusText,
      basePriceText,
      taxRateText,
    };
  }, [personName, firstNumberText, secondNumberText, temperatureCelsiusText, basePriceText, taxRateText]);

  const lessons = useMemo(() => {
    return [
      {
        key: "function_declaration",
        title: "1) Function Declaration",
        subtitle: "Classic function syntax. Hoisted (can be called before it appears).",
        tags: ["declaration", "hoisting", "parameters"],
        code: `// Function Declaration (hoisted)
function createGreetingMessage(personName) {
  // "personName" is a PARAMETER (placeholder name)
  return "Hello, " + personName + "!";
}

// When you CALL a function, you pass ARGUMENTS (real values)
const greetingForSunny = createGreetingMessage("Sunny");

console.log(greetingForSunny); // Hello, Sunny!`,
        run: (ctxLocal) => {
          function createGreetingMessage(personName) {
            return "Hello, " + personName + "!";
          }
          const greetingForPerson = createGreetingMessage(ctxLocal.personName);
          return [
            `[call] createGreetingMessage("${ctxLocal.personName}")`,
            `[result] ${greetingForPerson}`,
            `Parameter name used inside function: personName`,
            `Argument value you passed in: "${ctxLocal.personName}"`,
          ];
        },
      },
      {
        key: "function_expression",
        title: "2) Function Expression",
        subtitle: "A function stored in a variable. Not hoisted the same way.",
        tags: ["expression", "variables", "parameters"],
        code: `// Function Expression stored in a variable
const addTwoNumbers = function(firstNumber, secondNumber) {
  return firstNumber + secondNumber;
};

const total = addTwoNumbers(5, 7);
console.log(total); // 12`,
        run: (ctxLocal) => {
          const addTwoNumbers = function (firstNumber, secondNumber) {
            return firstNumber + secondNumber;
          };
          const firstNumber = toNumberOrZero(ctxLocal.firstNumberText);
          const secondNumber = toNumberOrZero(ctxLocal.secondNumberText);
          const total = addTwoNumbers(firstNumber, secondNumber);
          return [
            `[call] addTwoNumbers(${firstNumber}, ${secondNumber})`,
            `[result] ${total}`,
            `Parameter names: firstNumber, secondNumber`,
            `Argument values: ${firstNumber}, ${secondNumber}`,
          ];
        },
      },
      {
        key: "arrow_function",
        title: "3) Arrow Function",
        subtitle: "Shorter syntax. Common in React. Has different 'this' behavior.",
        tags: ["arrow", "modern", "parameters"],
        code: `// Arrow Function
const convertCelsiusToFahrenheit = (temperatureCelsius) => {
  return (temperatureCelsius * 9) / 5 + 32;
};

console.log(convertCelsiusToFahrenheit(20)); // 68`,
        run: (ctxLocal) => {
          const convertCelsiusToFahrenheit = (temperatureCelsius) => {
            return (temperatureCelsius * 9) / 5 + 32;
          };
          const temperatureCelsius = toNumberOrZero(ctxLocal.temperatureCelsiusText);
          const temperatureFahrenheit = convertCelsiusToFahrenheit(temperatureCelsius);
          return [
            `[call] convertCelsiusToFahrenheit(${temperatureCelsius})`,
            `[result] ${temperatureFahrenheit}`,
            `Parameter name: temperatureCelsius`,
            `Argument value: ${temperatureCelsius}`,
          ];
        },
      },
      {
        key: "default_parameters",
        title: "4) Default Parameters",
        subtitle: "Give parameters a fallback value if no argument is provided.",
        tags: ["defaults", "parameters", "safety"],
        code: `// Default Parameter example
function createFullName(firstName, lastName = "Unknown") {
  return firstName + " " + lastName;
}

console.log(createFullName("Sunny", "Gill")); // Sunny Gill
console.log(createFullName("Sunny"));         // Sunny Unknown`,
        run: (ctxLocal) => {
          function createFullName(firstName, lastName = "Unknown") {
            return firstName + " " + lastName;
          }

          const firstName = ctxLocal.personName || "Person";
          const withLastName = createFullName(firstName, "Gill");
          const withoutLastName = createFullName(firstName);

          return [
            `[call] createFullName("${firstName}", "Gill")`,
            `[result] ${withLastName}`,
            `[call] createFullName("${firstName}")`,
            `[result] ${withoutLastName}`,
            `Default parameter used when lastName argument is missing.`,
          ];
        },
      },
      {
        key: "return_vs_console",
        title: "5) Return vs console.log",
        subtitle: "Return sends a value back. console.log only prints.",
        tags: ["return", "console", "results"],
        code: `function multiplyNumbers(firstNumber, secondNumber) {
  console.log("Inside function:", firstNumber, secondNumber);
  return firstNumber * secondNumber; // return sends back the result
}

const result = multiplyNumbers(3, 4);
console.log("Outside function:", result); // 12`,
        run: (ctxLocal) => {
          function multiplyNumbers(firstNumber, secondNumber) {
            // ✅ FIX: correct template string (no backslashes)
            const insideLog = `Inside function: ${firstNumber} ${secondNumber}`;
            const resultValue = firstNumber * secondNumber;
            return { insideLog, resultValue };
          }

          const firstNumber = toNumberOrZero(ctxLocal.firstNumberText);
          const secondNumber = toNumberOrZero(ctxLocal.secondNumberText);

          const { insideLog, resultValue } = multiplyNumbers(firstNumber, secondNumber);

          return [
            insideLog,
            `[return] ${resultValue}`,
            `Return gives the value back to the caller.`,
            `console.log is just printing text.`,
          ];
        },
      },
      {
        key: "pure_function",
        title: "6) Pure Function",
        subtitle: "Same input → same output. No side effects. Easy to test.",
        tags: ["pure", "predictable", "no side effects"],
        code: `// Pure function: does not change anything outside itself
function calculateTotalWithTax(basePrice, taxRate) {
  return basePrice + basePrice * taxRate;
}

console.log(calculateTotalWithTax(100, 0.12)); // 112`,
        run: (ctxLocal) => {
          function calculateTotalWithTax(basePrice, taxRate) {
            return basePrice + basePrice * taxRate;
          }

          const basePrice = toNumberOrZero(ctxLocal.basePriceText);
          const taxRate = toNumberOrZero(ctxLocal.taxRateText);
          const total = calculateTotalWithTax(basePrice, taxRate);

          return [
            `[call] calculateTotalWithTax(${basePrice}, ${taxRate})`,
            `[result] ${total}`,
            `Parameter names: basePrice, taxRate`,
            `Argument values: ${basePrice}, ${taxRate}`,
            `Pure function: no outside changes.`,
          ];
        },
      },
      {
        key: "scope_basics",
        title: "7) Scope Basics",
        subtitle: "Variables inside a function are local (they stay inside).",
        tags: ["scope", "local variables", "function block"],
        code: `function buildMessage(personName) {
  const localMessage = "Welcome, " + personName; // local variable
  return localMessage;
}

// localMessage does NOT exist here (outside the function)
console.log(buildMessage("Sunny"));`,
        run: (ctxLocal) => {
          function buildMessage(personName) {
            const localMessage = "Welcome, " + personName;
            return localMessage;
          }

          const message = buildMessage(ctxLocal.personName);

          return [
            `[call] buildMessage("${ctxLocal.personName}")`,
            `[result] ${message}`,
            `localMessage is a LOCAL variable (only inside the function).`,
          ];
        },
      },
      {
        key: "callback_function",
        title: "8) Callback Function",
        subtitle: "A function passed into another function.",
        tags: ["callback", "higher-order", "reusable"],
        code: `function runMathOperation(firstNumber, secondNumber, operationFunction) {
  // operationFunction is a PARAMETER that expects a function
  return operationFunction(firstNumber, secondNumber);
}

function add(firstNumber, secondNumber) {
  return firstNumber + secondNumber;
}

const total = runMathOperation(5, 7, add);
console.log(total); // 12`,
        run: (ctxLocal) => {
          function runMathOperation(firstNumber, secondNumber, operationFunction) {
            return operationFunction(firstNumber, secondNumber);
          }
          function add(firstNumber, secondNumber) {
            return firstNumber + secondNumber;
          }

          const firstNumber = toNumberOrZero(ctxLocal.firstNumberText);
          const secondNumber = toNumberOrZero(ctxLocal.secondNumberText);
          const total = runMathOperation(firstNumber, secondNumber, add);

          return [
            `[call] runMathOperation(${firstNumber}, ${secondNumber}, add)`,
            `[result] ${total}`,
            `operationFunction is a PARAMETER that receives a FUNCTION.`,
            `add is the ARGUMENT (a function) you passed in.`,
          ];
        },
      },
    ];
  }, [
    ctx.personName,
    ctx.firstNumberText,
    ctx.secondNumberText,
    ctx.temperatureCelsiusText,
    ctx.basePriceText,
    ctx.taxRateText,
  ]);

  const runAllExamples = () => {
    console.log("[Day28FunctionsPage] runAllExamples clicked");

    try {
      const allLines = [];

      lessons.forEach((lesson) => {
        const lines = lesson.run(ctx);
        allLines.push(`--- RUN: ${lesson.title} ---`);
        allLines.push(...lines);
      });

      toast.success("✅ Ran ALL examples. Check output.", { toastId: "run-all" });
      setOutputLines((previousLines) => [...previousLines, ...allLines]);
    } catch (error) {
      console.log("[Day28FunctionsPage] run all failed:", error);
      toast.error("❌ Run all failed. Check console.", { toastId: "run-all-fail" });
      setOutputLines((previousLines) => [
        ...previousLines,
        "--- RUN ALL FAILED ---",
        String(error?.message || error),
      ]);
    }
  };

  const go = (path) => {
    console.log("[Day28FunctionsPage] navigating to:", path);
    toast.info(`Opening: ${path}`, { toastId: `nav-${path}` });
    router.push(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/80 font-bold">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-purple-700/20 via-purple-700/5 to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10">
        {/* header */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <span className="text-lg">☠️🔥</span>
              <span className="text-sm font-extrabold text-white/80">SkullFire Labs</span>
              <span className="text-sm font-extrabold text-purple-200">Day 28</span>
            </div>

            <Pill>Functions</Pill>
            <Pill>Parameters</Pill>
            <Pill>Arguments</Pill>
            <Pill>Variables</Pill>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Functions Practice Lab (All Examples)
          </h1>

          <p className="text-white/60 max-w-3xl">
            Every example is visible below on white “paper”. Use the same input values to see how
            different function types behave.
          </p>

          <div className="flex flex-wrap gap-3">
            <MiniButton tone="purple" onClick={() => go("/dashboard/day28")}>
              ⬅️ Back to Day 28 Hub
            </MiniButton>
            <MiniButton onClick={() => go("/dashboard/day28/dashboard")}>📊 Dashboard</MiniButton>
            <MiniButton onClick={() => go("/dashboard/day28/switch")}>🔀 Switch</MiniButton>
            <MiniButton onClick={() => go("/dashboard/day28/loops")}>🔁 Loops</MiniButton>

            <MiniButton tone="purple" onClick={runAllExamples}>
              ▶️ Run ALL Examples
            </MiniButton>
            <MiniButton onClick={clearOutput}>🧹 Clear Output</MiniButton>
          </div>
        </div>

        {/* main content */}
        <div className="mt-8 grid grid-cols-1 gap-6">
          <Card title="Mini glossary" subtitle="3 words you must understand.">
            <PaperGlossary />
          </Card>

          <Card title="Inputs used by all examples" subtitle="Change these and re-run examples.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-extrabold text-white">Inputs</div>

                <div className="mt-3 grid grid-cols-1 gap-3">
                  <label className="text-xs font-extrabold text-white/70">
                    Person name (string)
                    <input
                      value={personName}
                      onChange={(event) => setPersonName(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-400/40"
                      placeholder="Type a name..."
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs font-extrabold text-white/70">
                      First number
                      <input
                        value={firstNumberText}
                        onChange={(event) => setFirstNumberText(event.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-400/40"
                        placeholder="e.g. 5"
                      />
                    </label>

                    <label className="text-xs font-extrabold text-white/70">
                      Second number
                      <input
                        value={secondNumberText}
                        onChange={(event) => setSecondNumberText(event.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-400/40"
                        placeholder="e.g. 7"
                      />
                    </label>
                  </div>

                  <label className="text-xs font-extrabold text-white/70">
                    Temperature in Celsius
                    <input
                      value={temperatureCelsiusText}
                      onChange={(event) => setTemperatureCelsiusText(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-400/40"
                      placeholder="e.g. 20"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs font-extrabold text-white/70">
                      Base price
                      <input
                        value={basePriceText}
                        onChange={(event) => setBasePriceText(event.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-400/40"
                        placeholder="e.g. 100"
                      />
                    </label>

                    <label className="text-xs font-extrabold text-white/70">
                      Tax rate (decimal)
                      <input
                        value={taxRateText}
                        onChange={(event) => setTaxRateText(event.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-400/40"
                        placeholder="e.g. 0.12"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-extrabold text-white">Session Info</div>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white/60 font-bold">Authenticated</div>
                    <div className="text-white font-extrabold">
                      {isAuthenticated ? "✅ Yes" : "❌ No"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white/60 font-bold">User</div>
                    <div className="text-white/80 break-all">
                      {user?.email || user?.webUserEmail || user?.webUserId || "—"}
                    </div>
                  </div>

                  <MiniButton
                    onClick={() => {
                      console.log("[Day28FunctionsPage] refresh clicked");
                      toast.info("Refreshing…", { toastId: "refresh-day28-functions" });
                      router.refresh();
                    }}
                    tone="purple"
                  >
                    Refresh
                  </MiniButton>

                  <MiniButton
                    onClick={() => {
                      console.log("[Day28FunctionsPage] back clicked");
                      router.back();
                    }}
                  >
                    Back
                  </MiniButton>
                </div>
              </div>
            </div>
          </Card>

          {/* ALL EXAMPLES ON PAPER */}
          <Card
            title="All function examples (visible at once)"
            subtitle="Each example is shown as code + simple explanation."
          >
            <div className="grid grid-cols-1 gap-6">
              {lessons.map((lesson) => (
                <div key={lesson.key} className="grid grid-cols-1 gap-4">
                  <Paper title={lesson.title} subtitle={lesson.subtitle} right={lesson.tags.join(" • ")}>
                    <div className="text-xs text-zinc-700">
                      Look for: <span className="font-extrabold">parameters</span> inside parentheses,
                      and <span className="font-extrabold">arguments</span> inside the function call.
                    </div>

                    <div className="mt-3">
                      <PaperCodeBlock code={lesson.code} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          console.log("[Day28FunctionsPage] run single example:", lesson.key);
                          try {
                            const lines = lesson.run(ctx);
                            toast.success(`✅ Ran: ${lesson.title}`, {
                              toastId: `run-${lesson.key}`,
                            });
                            setOutputLines((previousLines) => [
                              ...previousLines,
                              `--- RUN: ${lesson.title} ---`,
                              ...lines,
                            ]);
                          } catch (error) {
                            console.log("[Day28FunctionsPage] run single failed:", error);
                            toast.error(`❌ Failed: ${lesson.title}`, {
                              toastId: `run-fail-${lesson.key}`,
                            });
                            setOutputLines((previousLines) => [
                              ...previousLines,
                              `--- RUN FAILED: ${lesson.title} ---`,
                              String(error?.message || error),
                            ]);
                          }
                        }}
                        className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-extrabold text-zinc-900 transition hover:bg-zinc-100 active:scale-[0.99]"
                      >
                        ▶️ Run this example
                      </button>

                      <div className="text-xs text-zinc-600 flex items-center">
                        Uses current inputs at the top.
                      </div>
                    </div>
                  </Paper>
                </div>
              ))}
            </div>
          </Card>

          {/* OUTPUT PAPER */}
          <Card title="Output log" subtitle="Results from running examples appear here.">
            <Paper title="Run output" subtitle="This output grows as you run more examples." right="Live log">
              <PaperOutputBox lines={outputLines} />
              <div className="mt-3 text-xs text-zinc-600">
                Tip: Click <span className="font-extrabold">Clear Output</span> to start fresh.
              </div>
            </Paper>
          </Card>

          {/* PRACTICE PROMPTS */}
          <Card title="Quick practice prompts" subtitle="Small tasks to help it stick.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-extrabold text-white">Practice 1</div>
                <div className="mt-1 text-white/70">
                  Write a function named{" "}
                  <span className="text-white font-mono text-xs">calculateSquare</span> that takes a
                  parameter named{" "}
                  <span className="text-white font-mono text-xs">numberToSquare</span> and returns the
                  squared number.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-extrabold text-white">Practice 2</div>
                <div className="mt-1 text-white/70">
                  Make an arrow function named{" "}
                  <span className="text-white font-mono text-xs">createEmailPreview</span> that takes{" "}
                  <span className="text-white font-mono text-xs">emailAddress</span> and returns
                  something like:{" "}
                  <span className="text-white font-mono text-xs">"Preview for: ___"</span>.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-extrabold text-white">Practice 3</div>
                <div className="mt-1 text-white/70">
                  Create a function with a default parameter:
                  <span className="text-white font-mono text-xs">
                    {" "}
                    createUserRole(roleName = "Viewer")
                  </span>
                  .
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-extrabold text-white">Practice 4</div>
                <div className="mt-1 text-white/70">
                  Write a callback example:
                  <span className="text-white font-mono text-xs">
                    {" "}
                    runStringOperation(textValue, operationFunction)
                  </span>{" "}
                  and pass in a function that turns text into uppercase.
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/60">
              Keep names readable: <span className="text-white font-bold">firstNumber</span>,{" "}
              <span className="text-white font-bold">secondNumber</span>,{" "}
              <span className="text-white font-bold">personName</span>. Avoid single letters while
              learning.
            </div>
          </Card>
        </div>

        <div className="mt-10 text-center text-xs text-white/40">
          Day 28 • Functions • /dashboard/day28/functions
        </div>
      </div>
    </div>
  );
}