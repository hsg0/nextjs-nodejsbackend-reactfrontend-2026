"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import useAuthCheck from "@/checkAuth/authCheck.js";
import callBackend from "@/lib/callBackend.js";

export default function Day20LabPage() {
  const { loading, user } = useAuthCheck();

  const params = useParams();
  const searchParams = useSearchParams();

  const adpath = params?.adpath;
  const emailFromQuery = searchParams.get("email") || "";

  const [listLoading, setListLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      province: "BC",
      country: "Canada",
    },
    zipCode: "",
    payment: {
      method: "card",
      last4: "",
    },
  });

  const effectiveEmail = useMemo(() => emailFromQuery || user?.email || "", [emailFromQuery, user]);

  useEffect(() => {
    console.log("[Day20LabPage] loaded");
    console.log("[Day20LabPage] adpath:", adpath);
    console.log("[Day20LabPage] email query:", emailFromQuery);
    console.log("[Day20LabPage] user from auth:", user);
  }, [adpath, emailFromQuery, user]);

  // ---------------------------
  // API: GET ALL
  // ---------------------------
  const fetchUsers = async () => {
    try {
      setListLoading(true);
      console.log("[Day20LabPage] GET day20 list...");

      const res = await callBackend.get("/web/api/day20/get-day20-data");

      console.log("[Day20LabPage] GET response:", res?.data);

      const list = res?.data?.day20Data || [];
      setUsers(list);
      console.log("[Day20LabPage] users loaded:", list.length);
    } catch (err) {
      console.log("[Day20LabPage] GET error:", err?.response?.data || err?.message || err);
      alert("GET failed — check console + backend logs");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // ---------------------------
  // API: POST CREATE
  // ---------------------------
  const createUser = async (e) => {
    e.preventDefault();

    try {
      setListLoading(true);
      console.log("[Day20LabPage] POST create payload:", form);

      const res = await callBackend.post("/web/api/day20/set-day20-data", form);

      console.log("[Day20LabPage] POST response:", res?.data);

      await fetchUsers();
      resetForm();
    } catch (err) {
      console.log("[Day20LabPage] POST error:", err?.response?.data || err?.message || err);
      alert(err?.response?.data?.message || "POST failed — check console + backend logs");
    } finally {
      setListLoading(false);
    }
  };

  // ---------------------------
  // API: PUT UPDATE
  // ---------------------------
  const updateUser = async (e) => {
    e.preventDefault();

    if (!editingId) {
      alert("No editingId set. Click Edit on a user first.");
      return;
    }

    try {
      setListLoading(true);
      console.log("[Day20LabPage] PUT update id:", editingId);
      console.log("[Day20LabPage] PUT update payload:", form);

      const res = await callBackend.put(`/web/api/day20/update-day20-data/${editingId}`, form);

      console.log("[Day20LabPage] PUT response:", res?.data);

      await fetchUsers();
      resetForm();
    } catch (err) {
      console.log("[Day20LabPage] PUT error:", err?.response?.data || err?.message || err);
      alert(err?.response?.data?.message || "PUT failed — check console + backend logs");
    } finally {
      setListLoading(false);
    }
  };

  // ---------------------------
  // API: DELETE
  // ---------------------------
  const deleteUser = async (id) => {
    const ok = confirm("Delete this user?");
    if (!ok) return;

    try {
      setListLoading(true);
      console.log("[Day20LabPage] DELETE id:", id);

      const res = await callBackend.delete(`/web/api/day20/delete-day20-data/${id}`);

      console.log("[Day20LabPage] DELETE response:", res?.data);

      await fetchUsers();

      // if you were editing this same one, reset
      if (editingId === id) resetForm();
    } catch (err) {
      console.log("[Day20LabPage] DELETE error:", err?.response?.data || err?.message || err);
      alert(err?.response?.data?.message || "DELETE failed — check console + backend logs");
    } finally {
      setListLoading(false);
    }
  };

  // ---------------------------
  // UI helpers
  // ---------------------------
  const resetForm = () => {
    console.log("[Day20LabPage] resetForm()");
    setMode("create");
    setEditingId("");
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        province: "BC",
        country: "Canada",
      },
      zipCode: "",
      payment: {
        method: "card",
        last4: "",
      },
    });
  };

  const startEdit = (u) => {
    console.log("[Day20LabPage] startEdit user:", u?._id, u);
    setMode("edit");
    setEditingId(u._id);

    setForm({
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email: u.email || "",
      phoneNumber: u.phoneNumber || "",
      address: {
        line1: u.address?.line1 || "",
        line2: u.address?.line2 || "",
        city: u.address?.city || "",
        province: u.address?.province || "BC",
        country: u.address?.country || "Canada",
      },
      zipCode: u.zipCode || "",
      payment: {
        method: u.payment?.method || "card",
        last4: u.payment?.last4 || "",
      },
    });
  };

  const submitHandler = mode === "edit" ? updateUser : createUser;

  // guard
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-5 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 to-black shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-widest text-white/60">DAY 20 • AXIOS CRUD</p>
                <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold">
                  ☠️🔥 SkullFire Users Lab
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  Route param: <span className="text-white font-semibold">{adpath}</span>
                  <span className="mx-2">•</span>
                  Email: <span className="text-white font-semibold">{effectiveEmail || "none"}</span>
                </p>
              </div>

              <div className="hidden sm:block text-right">
                <p className="text-xs text-white/60">Signed in</p>
                <p className="text-sm font-semibold">{user?.username || "User"}</p>
                <p className="text-xs text-white/60">{user?.email || ""}</p>
              </div>
            </div>

            <div className="my-6 h-px bg-white/10" />

            {/* FORM */}
            <form
              onSubmit={submitHandler}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {mode === "edit" ? "Edit User" : "Create User"}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Backend: /web/api/day20 (GET, POST, PUT, DELETE)
                  </p>
                  {mode === "edit" && (
                    <p className="text-xs text-orange-300 mt-1">
                      Editing ID: <span className="text-orange-200">{editingId}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={fetchUsers}
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm hover:bg-white/10"
                  >
                    Refresh
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm hover:bg-white/10"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Inputs */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={form.firstName}
                  onChange={(v) => setForm((p) => ({ ...p, firstName: v }))}
                  placeholder="Sunny"
                  required
                />

                <Input
                  label="Last Name"
                  value={form.lastName}
                  onChange={(v) => setForm((p) => ({ ...p, lastName: v }))}
                  placeholder="Gill"
                  required
                />

                <Input
                  label="Email"
                  value={form.email}
                  onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                  placeholder="sunny@example.com"
                  required
                />

                <Input
                  label="Phone Number"
                  value={form.phoneNumber}
                  onChange={(v) => setForm((p) => ({ ...p, phoneNumber: v }))}
                  placeholder="604-555-0101"
                  required
                />

                <Input
                  label="Address Line 1"
                  value={form.address.line1}
                  onChange={(v) => setForm((p) => ({ ...p, address: { ...p.address, line1: v } }))}
                  placeholder="123 SkullFire St"
                  required
                  full
                />

                <Input
                  label="Address Line 2 (optional)"
                  value={form.address.line2}
                  onChange={(v) => setForm((p) => ({ ...p, address: { ...p.address, line2: v } }))}
                  placeholder="Unit 9"
                  full
                />

                <Input
                  label="City"
                  value={form.address.city}
                  onChange={(v) => setForm((p) => ({ ...p, address: { ...p.address, city: v } }))}
                  placeholder="Vancouver"
                  required
                />

                <Input
                  label="Province"
                  value={form.address.province}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, address: { ...p.address, province: v } }))
                  }
                  placeholder="BC"
                  required
                />

                <Input
                  label="Country"
                  value={form.address.country}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, address: { ...p.address, country: v } }))
                  }
                  placeholder="Canada"
                />

                <Input
                  label="Zip / Postal Code"
                  value={form.zipCode}
                  onChange={(v) => setForm((p) => ({ ...p, zipCode: v }))}
                  placeholder="V6B 1A1"
                  required
                />

                <div className="md:col-span-1">
                  <label className="text-xs text-white/60">Payment Method</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none focus:border-orange-500/60"
                    value={form.payment.method}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        payment: { ...p.payment, method: e.target.value },
                      }))
                    }
                  >
                    <option value="card">Card</option>
                    <option value="cash">Cash</option>
                    <option value="etransfer">E-Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <Input
                  label="Card Last4 (optional)"
                  value={form.payment.last4}
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      payment: { ...p.payment, last4: v },
                    }))
                  }
                  placeholder="4242"
                />
              </div>

              {/* Submit */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  disabled={listLoading}
                  type="submit"
                  className="rounded-xl px-5 py-3 font-extrabold bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
                >
                  {listLoading
                    ? "Working..."
                    : mode === "edit"
                    ? "Update User (PUT)"
                    : "Create User (POST)"}
                </button>

                {mode === "edit" && (
                  <button
                    type="button"
                    disabled={listLoading}
                    onClick={resetForm}
                    className="rounded-xl border border-white/10 bg-black/40 px-5 py-3 font-semibold hover:bg-white/10 disabled:opacity-50"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            {/* LIST */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Users List (GET)</p>
                  <p className="text-xs text-white/60 mt-1">
                    Showing <span className="text-white/80 font-semibold">{users.length}</span>{" "}
                    record(s)
                  </p>
                </div>

                {listLoading && <p className="text-xs text-white/60">Loading…</p>}
              </div>

              <div className="mt-4 space-y-3">
                {users.length === 0 && !listLoading && (
                  <div className="text-sm text-white/60">No users yet. Create one above.</div>
                )}

                {users.map((u) => (
                  <div
                    key={u._id}
                    className="rounded-2xl border border-white/10 bg-black/40 p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <p className="font-extrabold">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-sm text-white/70">
                          {u.email} • {u.phoneNumber}
                        </p>
                        <p className="text-sm text-white/70 mt-1">
                          {u.address?.line1}
                          {u.address?.line2 ? `, ${u.address.line2}` : ""},{" "}
                          {u.address?.city}, {u.address?.province} • {u.zipCode}
                        </p>
                        <p className="text-xs text-white/50 mt-2">
                          Payment: {u.payment?.method || "card"}
                          {u.payment?.last4 ? ` • **** ${u.payment.last4}` : ""}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          id: {u._id}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          disabled={listLoading}
                          onClick={() => startEdit(u)}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          disabled={listLoading}
                          onClick={() => deleteUser(u._id)}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold hover:opacity-95 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom tip */}
            <div className="mt-6 text-xs text-white/50">
              Tip: Open DevTools Console to watch every Axios request/response log.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small reusable input */
function Input({ label, value, onChange, placeholder, required, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="text-xs text-white/60">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white placeholder:text-white/40 outline-none focus:border-orange-500/60"
      />
    </div>
  );
}