// src/app/(privateroutes)/dashboard/day74/page.jsx
"use client";

import React, { useState } from "react";
import USERS_50 from "@/components/trash/50users"; // ✅ best

const Page = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [allUsers, setAllUsers] = useState(USERS_50);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("✅ Form submitted:", { username, email });

    if (!username.trim() || !email.trim()) {
      console.log("❌ Missing username or email");
      return;
    }

    const newUser = {
      id: allUsers.length + 1,
      name: username.trim(),
      email: email.trim(),
      phone: "N/A",
    };

    setAllUsers((prev) => [...prev, newUser]);

    setUsername("");
    setEmail("");
  };

  return (
    <div style={{ padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <h1>Day 74</h1>
        <h2>Submit your details</h2>

        <input
          type="text"
          placeholder="Enter name"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            console.log("username:", e.target.value);
          }}
          style={{ padding: 10, width: 320, marginBottom: 10 }}
        />
        <br />

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            console.log("email:", e.target.value);
          }}
          style={{ padding: 10, width: 320, marginBottom: 10 }}
        />
        <br />

        <button type="submit" style={{ padding: "10px 14px" }}>
          Submit
        </button>
      </form>

      <div style={{ marginTop: 24 }}>
        <h2>All Users</h2>

        <div>
          {allUsers.map((user) => (
            <div
              key={user.id}
              style={{
                border: "1px solid black",
                margin: "10px 0",
                padding: "10px",
              }}
            >
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;