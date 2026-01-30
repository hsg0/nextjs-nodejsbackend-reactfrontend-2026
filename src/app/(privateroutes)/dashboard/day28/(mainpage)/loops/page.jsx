"use client";

// /src/app/(privateroutes)/dashboard/day28/(mainpage)/loops/page.jsx

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

function Pill({ text }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/70">
      {text}
    </span>
  );
}

function OutputBox({ title, lines }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="text-xs font-extrabold text-black/60 mb-2">{title}</div>
      <pre className="text-xs text-black whitespace-pre-wrap break-words leading-relaxed font-mono">
        {Array.isArray(lines) ? (lines.length ? lines.join("\n") : "—") : String(lines || "—")}
      </pre>
    </div>
  );
}

function SmallButton({ label, onClick, tone = "light" }) {
  const styles =
    tone === "purple"
      ? "bg-purple-600/20 hover:bg-purple-600/30 text-purple-100"
      : "bg-white/5 hover:bg-white/10 text-white/80";

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border border-white/10 px-4 py-3 font-extrabold transition active:scale-[0.99] ${styles}`}
    >
      {label}
    </button>
  );
}

function PaperBlock({ title, children }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      {title ? <div className="text-xs font-extrabold text-black/60 mb-2">{title}</div> : null}
      {children}
    </div>
  );
}

function CodePaper({ code }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="text-xs font-extrabold text-black/60 mb-2">Code</div>
      <pre className="text-xs text-black whitespace-pre-wrap break-words leading-relaxed font-mono">
        {code}
      </pre>
    </div>
  );
}

/* ------------------ safe practice runner ------------------ */
/**
 * IMPORTANT:
 * This is a learning page. This runner only supports a few simple patterns.
 * It DOES NOT run raw JavaScript. It just helps you practice safely.
 */

function parseCommaSeparatedList(text) {
  return String(text || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function runPracticeLoop({ loopKind, listText, startNumberText, endNumberText, wordPrefixText }) {
  console.log("[LoopsPractice] runPracticeLoop called:", {
    loopKind,
    listText,
    startNumberText,
    endNumberText,
    wordPrefixText,
  });

  const outputLines = [];

  const listOfFruits = parseCommaSeparatedList(listText);
  const startNumber = Number(startNumberText);
  const endNumber = Number(endNumberText);

  const safeStartNumber = Number.isFinite(startNumber) ? startNumber : 1;
  const safeEndNumber = Number.isFinite(endNumber) ? endNumber : safeStartNumber;

  const safeSmallPrefix = String(wordPrefixText || "Item").slice(0, 30);

  if (loopKind === "for") {
    for (let currentNumber = safeStartNumber; currentNumber <= safeEndNumber; currentNumber++) {
      outputLines.push(`${safeSmallPrefix} number: ${currentNumber}`);
    }
    return outputLines;
  }

  if (loopKind === "while") {
    let currentNumber = safeStartNumber;
    while (currentNumber <= safeEndNumber) {
      outputLines.push(`${safeSmallPrefix} number: ${currentNumber}`);
      currentNumber++;
    }
    return outputLines;
  }

  if (loopKind === "doWhile") {
    let currentNumber = safeStartNumber;
    do {
      outputLines.push(`${safeSmallPrefix} number: ${currentNumber}`);
      currentNumber++;
    } while (currentNumber <= safeEndNumber);
    return outputLines;
  }

  if (loopKind === "forOf") {
    for (const fruitName of listOfFruits) {
      outputLines.push(`Fruit: ${fruitName}`);
    }
    return outputLines;
  }

  if (loopKind === "forIn") {
    const fruitBasketObject = {
      firstFruit: listOfFruits[0] || "apple",
      secondFruit: listOfFruits[1] || "banana",
      thirdFruit: listOfFruits[2] || "orange",
    };

    for (const propertyName in fruitBasketObject) {
      outputLines.push(`${propertyName}: ${fruitBasketObject[propertyName]}`);
    }
    return outputLines;
  }

  if (loopKind === "forEach") {
    listOfFruits.forEach((fruitName, fruitIndexNumber) => {
      outputLines.push(`Index ${fruitIndexNumber}: ${fruitName}`);
    });
    return outputLines;
  }

  if (loopKind === "map") {
    const newList = listOfFruits.map((fruitName) => `Yummy ${fruitName}!`);
    outputLines.push("New list created with map():");
    newList.forEach((line) => outputLines.push(`- ${line}`));
    return outputLines;
  }

  if (loopKind === "filter") {
    const filteredList = listOfFruits.filter((fruitName) => fruitName.length >= 6);
    outputLines.push("Fruits with 6+ letters (filter):");
    filteredList.forEach((fruitName) => outputLines.push(`- ${fruitName}`));
    return outputLines;
  }

  if (loopKind === "reduce") {
    const combinedSentence = listOfFruits.reduce((sentenceSoFar, fruitName, fruitIndexNumber) => {
      const separator = fruitIndexNumber === 0 ? "" : ", ";
      return sentenceSoFar + separator + fruitName;
    }, "");

    outputLines.push("All fruit names combined into 1 sentence (reduce):");
    outputLines.push(combinedSentence || "—");
    return outputLines;
  }

  outputLines.push("Unknown loop kind.");
  return outputLines;
}

/* ------------------ page ------------------ */

export default function Day28LoopsPage() {
  const router = useRouter();
  const { loading, isAuthenticated, user } = useAuthCheck();

  useEffect(() => {
    console.log("[Day28LoopsPage] mounted");
  }, []);

  useEffect(() => {
    console.log("[Day28LoopsPage] auth state:", { loading, isAuthenticated, user });
  }, [loading, isAuthenticated, user]);

  const exampleOutput = useMemo(() => {
    console.log("[Day28LoopsPage] building example outputs...");

    const listOfFruitNames = ["apple", "banana", "cherry"];

    const output = {
      forLoop: [],
      whileLoop: [],
      doWhileLoop: [],
      forOfLoop: [],
      forInLoop: [],
      forEachLoop: [],
      mapLoop: [],
      filterLoop: [],
      reduceLoop: [],
    };

    // 1) for loop
    for (let currentCountNumber = 1; currentCountNumber <= 5; currentCountNumber++) {
      output.forLoop.push(`Counting with for loop: ${currentCountNumber}`);
    }

    // 2) while loop
    let currentWhileNumber = 1;
    while (currentWhileNumber <= 5) {
      output.whileLoop.push(`Counting with while loop: ${currentWhileNumber}`);
      currentWhileNumber++;
    }

    // 3) do...while loop
    let currentDoWhileNumber = 1;
    do {
      output.doWhileLoop.push(`Counting with do...while loop: ${currentDoWhileNumber}`);
      currentDoWhileNumber++;
    } while (currentDoWhileNumber <= 5);

    // 4) for...of
    for (const fruitName of listOfFruitNames) {
      output.forOfLoop.push(`Fruit name from for...of: ${fruitName}`);
    }

    // 5) for...in
    const fruitBasketObject = {
      firstFruit: "apple",
      secondFruit: "banana",
      thirdFruit: "cherry",
    };

    for (const fruitKeyName in fruitBasketObject) {
      output.forInLoop.push(`Key: ${fruitKeyName} → Value: ${fruitBasketObject[fruitKeyName]}`);
    }

    // 6) forEach
    listOfFruitNames.forEach((fruitName, fruitIndexNumber) => {
      output.forEachLoop.push(`forEach at index ${fruitIndexNumber}: ${fruitName}`);
    });

    // 7) map
    const listOfHappyFruits = listOfFruitNames.map((fruitName) => `Happy ${fruitName}`);
    output.mapLoop.push("map created a NEW list:");
    listOfHappyFruits.forEach((happyFruitName) => {
      output.mapLoop.push(`- ${happyFruitName}`);
    });

    // 8) filter
    const listOfLongFruitNames = listOfFruitNames.filter((fruitName) => fruitName.length >= 6);
    output.filterLoop.push("filter kept fruits with 6+ letters:");
    listOfLongFruitNames.forEach((fruitName) => output.filterLoop.push(`- ${fruitName}`));

    // 9) reduce
    const fruitSentence = listOfFruitNames.reduce((sentenceSoFar, fruitName, fruitIndexNumber) => {
      const separator = fruitIndexNumber === 0 ? "" : ", ";
      return sentenceSoFar + separator + fruitName;
    }, "");
    output.reduceLoop.push("reduce combined into one sentence:");
    output.reduceLoop.push(fruitSentence);

    return output;
  }, []);

  /* ------------------ practice state ------------------ */

  const [practiceListText, setPracticeListText] = useState("apple, banana, cherry, pineapple");
  const [practiceStartNumberText, setPracticeStartNumberText] = useState("1");
  const [practiceEndNumberText, setPracticeEndNumberText] = useState("5");
  const [practicePrefixText, setPracticePrefixText] = useState("Practice item");

  const [practiceOutputsByLoopName, setPracticeOutputsByLoopName] = useState({
    for: [],
    while: [],
    doWhile: [],
    forOf: [],
    forIn: [],
    forEach: [],
    map: [],
    filter: [],
    reduce: [],
  });

  const runOnePractice = (loopKind) => {
    console.log("[Day28LoopsPage] runOnePractice:", loopKind);

    const outputLines = runPracticeLoop({
      loopKind,
      listText: practiceListText,
      startNumberText: practiceStartNumberText,
      endNumberText: practiceEndNumberText,
      wordPrefixText: practicePrefixText,
    });

    setPracticeOutputsByLoopName((previousState) => ({
      ...previousState,
      [loopKind]: outputLines,
    }));

    toast.success(`✅ Ran practice: ${loopKind}`, { toastId: `practice-${loopKind}` });
  };

  const runAllPractice = () => {
    console.log("[Day28LoopsPage] runAllPractice");

    const loopKinds = ["for", "while", "doWhile", "forOf", "forIn", "forEach", "map", "filter", "reduce"];

    const newState = {};
    loopKinds.forEach((loopKind) => {
      newState[loopKind] = runPracticeLoop({
        loopKind,
        listText: practiceListText,
        startNumberText: practiceStartNumberText,
        endNumberText: practiceEndNumberText,
        wordPrefixText: practicePrefixText,
      });
    });

    setPracticeOutputsByLoopName((previousState) => ({
      ...previousState,
      ...newState,
    }));

    toast.success("✅ Ran ALL practice loops", { toastId: "practice-all" });
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
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-lg">☠️🔥</span>
            <span className="text-sm font-extrabold text-white/80">SkullFire Labs</span>
            <span className="text-sm font-extrabold text-purple-200">Day 28</span>
            <span className="text-sm font-extrabold text-white/70">Loops</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Loops Practice Page</h1>

          <p className="text-white/60 max-w-3xl">
            A <span className="text-white font-extrabold">loop</span> means:{" "}
            <span className="text-white/80">“Repeat something until you’re done.”</span>
            <br />
            Every example below shows:
            <span className="text-white font-extrabold"> what it does</span>,{" "}
            <span className="text-white font-extrabold"> the code</span>, and{" "}
            <span className="text-white font-extrabold"> the output</span>.
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            <Pill text="for" />
            <Pill text="while" />
            <Pill text="do...while" />
            <Pill text="for...of" />
            <Pill text="for...in" />
            <Pill text="forEach" />
            <Pill text="map" />
            <Pill text="filter" />
            <Pill text="reduce" />
          </div>

          <div className="flex flex-wrap gap-3 mt-3">
            <SmallButton tone="purple" label="Run ALL Practice Loops" onClick={runAllPractice} />

            <SmallButton
              label="Back to Day 28"
              onClick={() => {
                console.log("[Day28LoopsPage] Back clicked");
                router.push("/dashboard/day28");
              }}
            />

            <SmallButton
              label="Refresh"
              onClick={() => {
                console.log("[Day28LoopsPage] Refresh clicked");
                router.refresh();
              }}
            />
          </div>
        </div>

        {/* Practice inputs */}
        <div className="mt-8">
          <Card title="Practice Inputs" subtitle="Change these values, then run a loop.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-extrabold text-white/60 mb-2">
                  List for array loops (for...of, forEach, map, filter, reduce)
                </div>
                <input
                  value={practiceListText}
                  onChange={(e) => {
                    console.log("[PracticeInputs] list changed:", e.target.value);
                    setPracticeListText(e.target.value);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
                  placeholder="apple, banana, cherry"
                />
                <div className="text-xs text-white/50 mt-2">
                  Tip: Use commas. Example: <span className="text-white/70">cat, dog, fish</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-extrabold text-white/60 mb-2">
                  Numbers for counting loops (for, while, do...while)
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-white/50 mb-1">Start number</div>
                    <input
                      value={practiceStartNumberText}
                      onChange={(e) => {
                        console.log("[PracticeInputs] start number changed:", e.target.value);
                        setPracticeStartNumberText(e.target.value);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <div className="text-xs text-white/50 mb-1">End number</div>
                    <input
                      value={practiceEndNumberText}
                      onChange={(e) => {
                        console.log("[PracticeInputs] end number changed:", e.target.value);
                        setPracticeEndNumberText(e.target.value);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-white/50 mb-1">Prefix words (used in output)</div>
                  <input
                    value={practicePrefixText}
                    onChange={(e) => {
                      console.log("[PracticeInputs] prefix changed:", e.target.value);
                      setPracticePrefixText(e.target.value);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
                    placeholder="Practice item"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Examples grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1) for loop */}
          <Card title="1) for loop (counting)" subtitle="Use this when you know exactly how many times you want to repeat.">
            <PaperBlock title="What this loop is doing (simple words)">
              <div className="text-sm text-black/80 leading-relaxed">
                We start at <span className="font-extrabold">startNumber</span>.
                <br />
                We keep going while the number is <span className="font-extrabold">less than or equal</span> to{" "}
                <span className="font-extrabold">endNumber</span>.
                <br />
                Each time, we <span className="font-extrabold">increase by 1</span>.
              </div>
            </PaperBlock>

            <div className="mt-4">
              <CodePaper
                code={`// FOR LOOP (Counting)
const startNumber = 1;
const endNumber = 5;

for (let currentNumber = startNumber; currentNumber <= endNumber; currentNumber++) {
  console.log("Counting:", currentNumber);
}`}
              />
            </div>

            <div className="mt-4">
              <OutputBox title="Example output (what you would see)" lines={exampleOutput.forLoop} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <SmallButton tone="purple" label="Run practice for loop" onClick={() => runOnePractice("for")} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              Practice tip: change Start number and End number above, then run again.
            </div>

            <div className="mt-3">
              <OutputBox title="Your practice output" lines={practiceOutputsByLoopName.for} />
            </div>
          </Card>

          {/* 2) while loop */}
          <Card title="2) while loop (repeat until done)" subtitle="Use this when you want to keep going while something is true.">
            <PaperBlock title="What this loop is doing (simple words)">
              <div className="text-sm text-black/80 leading-relaxed">
                A <span className="font-extrabold">while</span> loop checks the rule first.
                <br />
                If the rule is <span className="font-extrabold">true</span>, it runs.
                <br />
                If the rule is <span className="font-extrabold">false</span>, it stops.
              </div>
            </PaperBlock>

            <div className="mt-4">
              <CodePaper
                code={`// WHILE LOOP (Counting)
const startNumber = 1;
const endNumber = 5;

let currentNumber = startNumber;

while (currentNumber <= endNumber) {
  console.log("Counting:", currentNumber);
  currentNumber++; // IMPORTANT: move forward so the loop can end
}`}
              />
            </div>

            <div className="mt-4">
              <OutputBox title="Example output (what you would see)" lines={exampleOutput.whileLoop} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <SmallButton tone="purple" label="Run practice while loop" onClick={() => runOnePractice("while")} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              Practice tip: if you forget <span className="text-white font-extrabold">currentNumber++</span>, it can loop forever.
            </div>

            <div className="mt-3">
              <OutputBox title="Your practice output" lines={practiceOutputsByLoopName.while} />
            </div>
          </Card>

          {/* 3) do...while loop */}
          <Card title="3) do...while loop (always runs once)" subtitle="This loop runs the code first, then checks the condition.">
            <PaperBlock title="What this loop is doing (simple words)">
              <div className="text-sm text-black/80 leading-relaxed">
                A <span className="font-extrabold">do...while</span> loop runs the code{" "}
                <span className="font-extrabold">at least one time</span>.
                <br />
                Then it checks the rule. If the rule is true, it keeps going.
              </div>
            </PaperBlock>

            <div className="mt-4">
              <CodePaper
                code={`// DO...WHILE LOOP (Counting)
const startNumber = 1;
const endNumber = 5;

let currentNumber = startNumber;

do {
  console.log("Counting:", currentNumber);
  currentNumber++;
} while (currentNumber <= endNumber);`}
              />
            </div>

            <div className="mt-4">
              <OutputBox title="Example output (what you would see)" lines={exampleOutput.doWhileLoop} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <SmallButton tone="purple" label="Run practice do...while loop" onClick={() => runOnePractice("doWhile")} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              Practice tip: set Start number bigger than End number and see it still prints once.
            </div>

            <div className="mt-3">
              <OutputBox title="Your practice output" lines={practiceOutputsByLoopName.doWhile} />
            </div>
          </Card>

          {/* 4) for...of loop */}
          <Card title="4) for...of loop (loop through array values)" subtitle="Use this to read each item in a list (array).">
            <PaperBlock title="What this loop is doing (simple words)">
              <div className="text-sm text-black/80 leading-relaxed">
                We have a list (array) of fruit names.
                <br />
                <span className="font-extrabold">for...of</span> takes each fruit value, one-by-one,
                and puts it into <span className="font-extrabold">currentFruitName</span>.
              </div>
            </PaperBlock>

            <div className="mt-4">
              <CodePaper
                code={`// FOR...OF LOOP (Array values)
const listOfFruitNames = ["apple", "banana", "cherry"];

for (const currentFruitName of listOfFruitNames) {
  console.log("Fruit:", currentFruitName);
}`}
              />
            </div>

            <div className="mt-4">
              <OutputBox title="Example output (what you would see)" lines={exampleOutput.forOfLoop} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <SmallButton tone="purple" label="Run practice for...of loop" onClick={() => runOnePractice("forOf")} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              Practice tip: edit the list above (comma separated) and run again.
            </div>

            <div className="mt-3">
              <OutputBox title="Your practice output" lines={practiceOutputsByLoopName.forOf} />
            </div>
          </Card>

          {/* 5) for...in loop */}
          <Card title="5) for...in loop (loop through object keys)" subtitle="Use this when you have an object and you want its key names.">
            <PaperBlock title="What this loop is doing (simple words)">
              <div className="text-sm text-black/80 leading-relaxed">
                An <span className="font-extrabold">object</span> has{" "}
                <span className="font-extrabold">keys</span> and <span className="font-extrabold">values</span>.
                <br />
                <span className="font-extrabold">for...in</span> loops through the{" "}
                <span className="font-extrabold">keys</span>.
              </div>
            </PaperBlock>

            <div className="mt-4">
              <CodePaper
                code={`// FOR...IN LOOP (Object keys)
const fruitBasketObject = {
  firstFruit: "apple",
  secondFruit: "banana",
  thirdFruit: "cherry",
};

for (const fruitKeyName in fruitBasketObject) {
  console.log("Key:", fruitKeyName, "Value:", fruitBasketObject[fruitKeyName]);
}`}
              />
            </div>

            <div className="mt-4">
              <OutputBox title="Example output (what you would see)" lines={exampleOutput.forInLoop} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <SmallButton tone="purple" label="Run practice for...in loop" onClick={() => runOnePractice("forIn")} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              Note: In practice mode, we build a simple object like: firstFruit, secondFruit, thirdFruit.
            </div>

            <div className="mt-3">
              <OutputBox title="Your practice output" lines={practiceOutputsByLoopName.forIn} />
            </div>
          </Card>

          {/* 6) forEach */}
          <Card title="6) forEach (array helper)" subtitle="Use this when you want to do something for every item in an array.">
            <PaperBlock title="What this loop is doing (simple words)">
              <div className="text-sm text-black/80 leading-relaxed">
                <span className="font-extrabold">forEach</span> is an array helper.
                <br />
                It runs a function once for every item in the list.
                <br />
                It gives you the <span className="font-extrabold">value</span> and the <span className="font-extrabold">index</span>.
              </div>
            </PaperBlock>

            <div className="mt-4">
              <CodePaper
                code={`// forEach (Array helper)
const listOfFruitNames = ["apple", "banana", "cherry"];

listOfFruitNames.forEach((currentFruitName, currentIndexNumber) => {
  console.log("Index:", currentIndexNumber, "Fruit:", currentFruitName);
});`}
              />
            </div>

            <div className="mt-4">
              <OutputBox title="Example output (what you would see)" lines={exampleOutput.forEachLoop} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <SmallButton tone="purple" label="Run practice forEach" onClick={() => runOnePractice("forEach")} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              Practice tip: forEach is great for “just do this for each item.”
            </div>

            <div className="mt-3">
              <OutputBox title="Your practice output" lines={practiceOutputsByLoopName.forEach} />
            </div>
          </Card>

          {/* 7) map */}
          <Card title="7) map (create a NEW array)" subtitle="Use map when you want to transform each item into something new.">
            <PaperBlock title="What this loop is doing (simple words)">
              <div className="text-sm text-black/80 leading-relaxed">
                <span className="font-extrabold">map</span> creates a{" "}
                <span className="font-extrabold">new list</span>.
                <br />
                It takes each item and returns a new version of it.
              </div>
            </PaperBlock>

            <div className="mt-4">
              <CodePaper
                code={`// map (Make a NEW array)
const listOfFruitNames = ["apple", "banana", "cherry"];

const listOfHappyFruits = listOfFruitNames.map((currentFruitName) => {
  return "Happy " + currentFruitName;
});

console.log(listOfHappyFruits);`}
              />
            </div>

            <div className="mt-4">
              <OutputBox title="Example output (what you would see)" lines={exampleOutput.mapLoop} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <SmallButton tone="purple" label="Run practice map" onClick={() => runOnePractice("map")} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              Practice tip: map returns a new array (it does not change the original list).
            </div>

            <div className="mt-3">
              <OutputBox title="Your practice output" lines={practiceOutputsByLoopName.map} />
            </div>
          </Card>

          {/* 8) filter */}
          <Card title="8) filter (keep only some items)" subtitle="Use filter when you want to remove items that don’t match your rule.">
            <PaperBlock title="What this loop is doing (simple words)">
              <div className="text-sm text-black/80 leading-relaxed">
                <span className="font-extrabold">filter</span> keeps only the items that pass a rule.
                <br />
                If the rule returns <span className="font-extrabold">true</span>, the item stays.
                <br />
                If the rule returns <span className="font-extrabold">false</span>, the item is removed.
              </div>
            </PaperBlock>

            <div className="mt-4">
              <CodePaper
                code={`// filter (Keep only items that match a rule)
const listOfFruitNames = ["apple", "banana", "cherry"];

const listOfLongFruitNames = listOfFruitNames.filter((currentFruitName) => {
  return currentFruitName.length >= 6;
});

console.log(listOfLongFruitNames);`}
              />
            </div>

            <div className="mt-4">
              <OutputBox title="Example output (what you would see)" lines={exampleOutput.filterLoop} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <SmallButton tone="purple" label="Run practice filter" onClick={() => runOnePractice("filter")} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              Practice tip: try short names like <span className="text-white/80">kiwi</span> and long names like{" "}
              <span className="text-white/80">pineapple</span>.
            </div>

            <div className="mt-3">
              <OutputBox title="Your practice output" lines={practiceOutputsByLoopName.filter} />
            </div>
          </Card>

          {/* 9) reduce */}
          <Card title="9) reduce (combine into ONE value)" subtitle="Use reduce when you want one result (like a total, or a sentence).">
            <PaperBlock title="What this loop is doing (simple words)">
              <div className="text-sm text-black/80 leading-relaxed">
                <span className="font-extrabold">reduce</span> combines many items into{" "}
                <span className="font-extrabold">one final answer</span>.
                <br />
                You keep adding to a “result so far” until you finish.
              </div>
            </PaperBlock>

            <div className="mt-4">
              <CodePaper
                code={`// reduce (Combine into ONE value)
const listOfFruitNames = ["apple", "banana", "cherry"];

const combinedSentence = listOfFruitNames.reduce((sentenceSoFar, currentFruitName, currentIndexNumber) => {
  const separator = currentIndexNumber === 0 ? "" : ", ";
  return sentenceSoFar + separator + currentFruitName;
}, "");

console.log(combinedSentence);`}
              />
            </div>

            <div className="mt-4">
              <OutputBox title="Example output (what you would see)" lines={exampleOutput.reduceLoop} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <SmallButton tone="purple" label="Run practice reduce" onClick={() => runOnePractice("reduce")} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              Practice tip: reduce is like “keep adding to one final answer.”
            </div>

            <div className="mt-3">
              <OutputBox title="Your practice output" lines={practiceOutputsByLoopName.reduce} />
            </div>
          </Card>
        </div>

        {/* footer */}
        <div className="mt-10 text-center text-xs text-white/40">Day 28 • Loops • /dashboard/day28/loops</div>
      </div>
    </div>
  );
}