"use client";

// /src/app/(privateroutes)/dashboard/day28/(mainpage)/switch/page.jsx
// Day 28 - Switch Practice Lab (simple, editable, learnable)
// ✅ Updated: ALL single/double/triple letter variables + params renamed to full descriptive wording

import React, { useEffect, useMemo, useState } from "react";

/* ------------------ small UI helpers ------------------ */

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
      <div className="flex items-start justify-between gap-3">
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
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/70">
      {children}
    </span>
  );
}

function CodeBox({ title, code }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
      {title ? <div className="text-xs font-extrabold text-white/70 mb-2">{title}</div> : null}
      <pre className="overflow-auto text-xs text-white/70 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="text-xs font-bold text-white/60 mb-2">{label}</div>
      <input
        value={value}
        onChange={(eventObject) => onChange(eventObject.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-400/40 focus:bg-white/10"
      />
    </label>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <label className="block">
      <div className="text-xs font-bold text-white/60 mb-2">{label}</div>
      <select
        value={value}
        onChange={(eventObject) => onChange(eventObject.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-purple-400/40 focus:bg-white/10"
      >
        {options.map((optionItem) => (
          <option key={optionItem.value} value={optionItem.value} className="bg-black">
            {optionItem.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Button({ children, onClick, variant = "primary" }) {
  const baseButtonClasses =
    "rounded-2xl px-4 py-3 font-extrabold text-sm border transition active:scale-[0.99]";

  const variantButtonClasses =
    variant === "primary"
      ? "border-purple-400/30 bg-purple-600/20 text-purple-100 hover:bg-purple-600/30"
      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20";

  return (
    <button onClick={onClick} className={`${baseButtonClasses} ${variantButtonClasses}`}>
      {children}
    </button>
  );
}

/* ------------------ switch examples (logic) ------------------ */

// 1) Bare-bones switch: return a simple message
function bareBonesSwitch(rawUserInputText) {
  console.log("[bareBonesSwitch] rawUserInputText:", rawUserInputText);

  const normalizedUserInputText = String(rawUserInputText || "").toLowerCase().trim();

  switch (normalizedUserInputText) {
    case "a":
      return "You typed 'a' ✅";
    case "b":
      return "You typed 'b' ✅";
    case "c":
      return "You typed 'c' ✅";
    default:
      return "Default: type a / b / c";
  }
}

// 2) Switch + if together: handle extra validation first
function switchWithIf(rawAgeInputText) {
  console.log("[switchWithIf] rawAgeInputText:", rawAgeInputText);

  // IF first: validate
  const parsedAgeNumber = Number(rawAgeInputText);

  if (Number.isNaN(parsedAgeNumber)) return "Not a number ❌";
  if (parsedAgeNumber < 0) return "Age can’t be negative ❌";

  // Switch second: categorize
  switch (true) {
    case parsedAgeNumber < 13:
      return "Category: child";
    case parsedAgeNumber < 20:
      return "Category: teen";
    case parsedAgeNumber < 65:
      return "Category: adult";
    default:
      return "Category: senior";
  }
}

// 3) Switch inside a function (classic calculator)
function switchCalculator(firstNumberInputText, secondNumberInputText, selectedOperationKey) {
  console.log(
    "[switchCalculator] firstNumberInputText:",
    firstNumberInputText,
    "secondNumberInputText:",
    secondNumberInputText,
    "selectedOperationKey:",
    selectedOperationKey
  );

  const parsedFirstNumber = Number(firstNumberInputText);
  const parsedSecondNumber = Number(secondNumberInputText);

  if (Number.isNaN(parsedFirstNumber) || Number.isNaN(parsedSecondNumber)) {
    return { ok: false, value: null, message: "Enter numbers." };
  }

  switch (selectedOperationKey) {
    case "add":
      return { ok: true, value: parsedFirstNumber + parsedSecondNumber, message: "a + b" };
    case "sub":
      return { ok: true, value: parsedFirstNumber - parsedSecondNumber, message: "a - b" };
    case "mul":
      return { ok: true, value: parsedFirstNumber * parsedSecondNumber, message: "a * b" };
    case "div":
      if (parsedSecondNumber === 0) return { ok: false, value: null, message: "Cannot divide by 0." };
      return { ok: true, value: parsedFirstNumber / parsedSecondNumber, message: "a ÷ b" };
    default:
      return { ok: false, value: null, message: "Pick an operation." };
  }
}

// 4) Multiple cases falling through (grouping)
function switchGrouping(rawDayInputText) {
  console.log("[switchGrouping] rawDayInputText:", rawDayInputText);

  const normalizedDayInputText = String(rawDayInputText || "").toLowerCase().trim();

  switch (normalizedDayInputText) {
    case "sat":
    case "saturday":
    case "sun":
    case "sunday":
      return "It’s the weekend 🎉";
    case "mon":
    case "monday":
    case "tue":
    case "tuesday":
    case "wed":
    case "wednesday":
    case "thu":
    case "thursday":
    case "fri":
    case "friday":
      return "It’s a weekday 🧠";
    default:
      return "Unknown day. Try mon/tue/... or saturday/sunday.";
  }
}

// 5) Object-map alternative (when you don’t need switch)
function objectMapAlternative(rawMoodKeywordText) {
  console.log("[objectMapAlternative] rawMoodKeywordText:", rawMoodKeywordText);

  const moodMessageMap = {
    happy: "🙂 Happy path",
    sad: "🙁 Sad path",
    angry: "😠 Angry path",
  };

  const normalizedMoodKeywordText = String(rawMoodKeywordText || "").toLowerCase().trim();
  return moodMessageMap[normalizedMoodKeywordText] || "Default: try happy / sad / angry";
}

/* ------------------ page ------------------ */

export default function Day28SwitchLabPage() {
  // Section 1: bare bones
  const [letterInputText, setLetterInputText] = useState("");
  const letterInputOutputMessage = useMemo(
    () => bareBonesSwitch(letterInputText),
    [letterInputText]
  );

  // Section 2: switch + if
  const [ageInputText, setAgeInputText] = useState("");
  const ageCategoryOutputMessage = useMemo(
    () => switchWithIf(ageInputText),
    [ageInputText]
  );

  // Section 3: switch + function (calculator)
  const [firstNumberInputText, setFirstNumberInputText] = useState("10");
  const [secondNumberInputText, setSecondNumberInputText] = useState("5");
  const [selectedOperationKey, setSelectedOperationKey] = useState("add");

  const calculatorResultObject = useMemo(
    () => switchCalculator(firstNumberInputText, secondNumberInputText, selectedOperationKey),
    [firstNumberInputText, secondNumberInputText, selectedOperationKey]
  );

  // Section 4: grouping (fall-through)
  const [dayInputText, setDayInputText] = useState("");
  const dayTypeOutputMessage = useMemo(
    () => switchGrouping(dayInputText),
    [dayInputText]
  );

  // Section 5: object map alt
  const [moodKeywordText, setMoodKeywordText] = useState("");
  const moodOutputMessage = useMemo(
    () => objectMapAlternative(moodKeywordText),
    [moodKeywordText]
  );

  useEffect(() => {
    console.log("[Day28SwitchLabPage] mounted");
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Pill>☠️🔥 Day 28</Pill>
          <Pill>Switch Statements</Pill>
          <Pill>Practice Lab</Pill>
        </div>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Switch Practice Lab</h1>
        <p className="mt-2 text-white/60 max-w-2xl">
          Simple examples you can edit fast. Type values, see results instantly, then tweak the switch logic.
        </p>
      </div>

      {/* grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1) bare bones */}
        <Card title="1) Bare-bones switch" subtitle="Classic switch on a string (a / b / c).">
          <div className="space-y-4">
            <TextInput
              label="Type a, b, or c"
              value={letterInputText}
              onChange={setLetterInputText}
              placeholder="Try: a"
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-extrabold text-white/60 mb-2">Output</div>
              <div className="font-extrabold">{letterInputOutputMessage}</div>
            </div>

            <CodeBox
              title="Code you can tweak"
              code={`function bareBonesSwitch(rawUserInputText) {
  const normalizedUserInputText = String(rawUserInputText || "").toLowerCase().trim();

  switch (normalizedUserInputText) {
    case "a":
      return "You typed 'a' ✅";
    case "b":
      return "You typed 'b' ✅";
    case "c":
      return "You typed 'c' ✅";
    default:
      return "Default: type a / b / c";
  }
}`}
            />
          </div>
        </Card>

        {/* 2) switch + if */}
        <Card title="2) Switch with IF validation" subtitle="IF validates first, then switch categorizes.">
          <div className="space-y-4">
            <TextInput
              label="Enter an age"
              value={ageInputText}
              onChange={setAgeInputText}
              placeholder="Try: 17"
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-extrabold text-white/60 mb-2">Output</div>
              <div className="font-extrabold">{ageCategoryOutputMessage}</div>
            </div>

            <CodeBox
              title="Code you can tweak"
              code={`function switchWithIf(rawAgeInputText) {
  const parsedAgeNumber = Number(rawAgeInputText);

  if (Number.isNaN(parsedAgeNumber)) return "Not a number ❌";
  if (parsedAgeNumber < 0) return "Age can’t be negative ❌";

  switch (true) {
    case parsedAgeNumber < 13:
      return "Category: child";
    case parsedAgeNumber < 20:
      return "Category: teen";
    case parsedAgeNumber < 65:
      return "Category: adult";
    default:
      return "Category: senior";
  }
}`}
            />
          </div>
        </Card>

        {/* 3) switch in function (calculator) */}
        <Card title="3) Switch inside a function (mini calculator)" subtitle="Switch picks behavior based on operation.">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <TextInput
                label="first number"
                value={firstNumberInputText}
                onChange={setFirstNumberInputText}
                placeholder="10"
              />
              <TextInput
                label="second number"
                value={secondNumberInputText}
                onChange={setSecondNumberInputText}
                placeholder="5"
              />
              <Select
                label="operation"
                value={selectedOperationKey}
                onChange={setSelectedOperationKey}
                options={[
                  { value: "add", label: "add (+)" },
                  { value: "sub", label: "subtract (-)" },
                  { value: "mul", label: "multiply (*)" },
                  { value: "div", label: "divide (/)" },
                ]}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-extrabold text-white/60 mb-2">Output</div>
              <div className="font-extrabold">
                {calculatorResultObject.ok ? (
                  <>
                    ✅ {calculatorResultObject.message} ={" "}
                    <span className="text-purple-200">{String(calculatorResultObject.value)}</span>
                  </>
                ) : (
                  <>❌ {calculatorResultObject.message}</>
                )}
              </div>
            </div>

            <CodeBox
              title="Code you can tweak"
              code={`function switchCalculator(firstNumberInputText, secondNumberInputText, selectedOperationKey) {
  const parsedFirstNumber = Number(firstNumberInputText);
  const parsedSecondNumber = Number(secondNumberInputText);

  if (Number.isNaN(parsedFirstNumber) || Number.isNaN(parsedSecondNumber)) {
    return { ok: false, value: null, message: "Enter numbers." };
  }

  switch (selectedOperationKey) {
    case "add":
      return { ok: true, value: parsedFirstNumber + parsedSecondNumber, message: "a + b" };
    case "sub":
      return { ok: true, value: parsedFirstNumber - parsedSecondNumber, message: "a - b" };
    case "mul":
      return { ok: true, value: parsedFirstNumber * parsedSecondNumber, message: "a * b" };
    case "div":
      if (parsedSecondNumber === 0) return { ok: false, value: null, message: "Cannot divide by 0." };
      return { ok: true, value: parsedFirstNumber / parsedSecondNumber, message: "a ÷ b" };
    default:
      return { ok: false, value: null, message: "Pick an operation." };
  }
}`}
            />
          </div>
        </Card>

        {/* 4) grouping / fall-through */}
        <Card title="4) Multiple cases (grouping / fall-through)" subtitle="One output for many inputs (sat/sun = weekend).">
          <div className="space-y-4">
            <TextInput
              label="Enter a day (mon, tue, saturday, sun...)"
              value={dayInputText}
              onChange={setDayInputText}
              placeholder="Try: saturday"
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-extrabold text-white/60 mb-2">Output</div>
              <div className="font-extrabold">{dayTypeOutputMessage}</div>
            </div>

            <CodeBox
              title="Code you can tweak"
              code={`function switchGrouping(rawDayInputText) {
  const normalizedDayInputText = String(rawDayInputText || "").toLowerCase().trim();

  switch (normalizedDayInputText) {
    case "sat":
    case "saturday":
    case "sun":
    case "sunday":
      return "It’s the weekend 🎉";

    case "mon":
    case "monday":
    case "tue":
    case "tuesday":
    case "wed":
    case "wednesday":
    case "thu":
    case "thursday":
    case "fri":
    case "friday":
      return "It’s a weekday 🧠";

    default:
      return "Unknown day. Try mon/tue/... or saturday/sunday.";
  }
}`}
            />
          </div>
        </Card>

        {/* 5) object map alternative */}
        <Card title="5) “Do I even need switch?” (Object map alternative)" subtitle="Sometimes a lookup object is simpler than switch.">
          <div className="space-y-4">
            <TextInput
              label="Enter mood (happy / sad / angry)"
              value={moodKeywordText}
              onChange={setMoodKeywordText}
              placeholder="Try: happy"
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-extrabold text-white/60 mb-2">Output</div>
              <div className="font-extrabold">{moodOutputMessage}</div>
            </div>

            <CodeBox
              title="Code you can tweak"
              code={`function objectMapAlternative(rawMoodKeywordText) {
  const moodMessageMap = {
    happy: "🙂 Happy path",
    sad: "🙁 Sad path",
    angry: "😠 Angry path",
  };

  const normalizedMoodKeywordText = String(rawMoodKeywordText || "").toLowerCase().trim();
  return moodMessageMap[normalizedMoodKeywordText] || "Default: try happy / sad / angry";
}`}
            />
          </div>
        </Card>

        {/* 6) quick challenges */}
        <Card title="6) Quick challenges (edit the code above)" subtitle="Simple tasks to practice.">
          <div className="space-y-3 text-sm text-white/70">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-extrabold text-white mb-1">Challenge A</div>
              <div>
                In <span className="text-white font-bold">bareBonesSwitch</span>, add cases for{" "}
                <span className="text-white font-bold">d</span> and{" "}
                <span className="text-white font-bold">e</span>.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-extrabold text-white mb-1">Challenge B</div>
              <div>
                In <span className="text-white font-bold">switchWithIf</span>, add a new category:
                “very senior” for age 90+.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-extrabold text-white mb-1">Challenge C</div>
              <div>
                In <span className="text-white font-bold">switchCalculator</span>, add{" "}
                <span className="text-white font-bold">mod</span> (remainder) and a UI option for it.
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                variant="secondary"
                onClick={() => {
                  console.log("[Day28SwitchLabPage] reset clicked");
                  setLetterInputText("");
                  setAgeInputText("");
                  setFirstNumberInputText("10");
                  setSecondNumberInputText("5");
                  setSelectedOperationKey("add");
                  setDayInputText("");
                  setMoodKeywordText("");
                }}
              >
                Reset All Inputs
              </Button>

              <Button
                onClick={() => {
                  console.log("[Day28SwitchLabPage] tip clicked");
                  alert(
                    "Tip: switch compares with ===.\nSo normalize strings: toLowerCase().trim()\nAnd for ranges, use: switch(true) { case n < 10: ... }"
                  );
                }}
              >
                Show Tip
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-10 text-center text-xs text-white/40">
        Day 28 • Switch Lab • edit + tweak + learn
      </div>
    </div>
  );
}