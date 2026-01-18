"use client";

import callBackend from "@/lib/callBackend";
import React, { useState } from "react";

const Page = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");

  const saveToLocalStorage = async (e) => {
    e.preventDefault();

    const userData = { name, email, age, address };

    // ✅ 1) Save locally
    try {
      localStorage.setItem("userData", JSON.stringify(userData));
      console.log("✅ Data saved to localStorage:", userData);
    } catch (error) {
      console.error("❌ Error saving to localStorage:", error);
    }

    // ✅ 2) Send to backend
    try {
      // IMPORTANT:
      // If your backend is Express with base: app.use('/web/api/auth'...) etc,
      // you need a route that actually exists (example below)
      const res = await callBackend.post("/web/api/data/save-user-data", userData);
      console.log("✅ Data sent to backend:", res.data);
    } catch (backendError) {
      console.error("❌ Error sending data to backend:", backendError?.response?.data || backendError);
    }
  };

  return (
    <div>
      <h1>Day 75</h1>
      <h2>Local Storage in Next.js v16.1.1</h2>

      <form onSubmit={saveToLocalStorage} className="flex flex-col gap-2">
        <input
          className="w-[33%] bg-amber-50 text-black p-2 rounded"
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-[33%] bg-amber-50 text-black p-2 rounded"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-[33%] bg-amber-50 text-black p-2 rounded"
          type="number"
          placeholder="Enter age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <input
          className="w-[33%] bg-amber-50 text-black p-2 rounded"
          type="text"
          placeholder="Enter address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button
          type="submit"
          className="w-[20%] bg-blue-500 text-white p-2 rounded-md"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Page;