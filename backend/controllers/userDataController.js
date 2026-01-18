// // nextjs-reactjs-practice-2026:backend/controllers/userDataController.js
import UserDataModel from "../models/userDataModel.js";

export const saveUserData = async (req, res) => {
  try {
    console.log("[saveUserData] hit");

    if (!req.user) {
      console.log("[saveUserData] ❌ no req.user");
      return res.status(401).json({ message: "Not authorized" });
    }

    const { name, email, age, address } = req.body || {};

    if (!name || !email || age === undefined || !address) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // simple upsert by email (since your schema has unique email)
    const saved = await UserDataModel.findOneAndUpdate(
      { email: String(email).toLowerCase().trim() },
      {
        name: String(name).trim(),
        email: String(email).toLowerCase().trim(),
        age: Number(age),
        address: String(address).trim(),
      },
      { new: true, upsert: true }
    );

    console.log("[saveUserData] ✅ saved:", saved?._id);
    return res.status(200).json({ message: "Saved", data: saved });
  } catch (err) {
    console.error("[saveUserData] ❌ error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserData = async (req, res) => {
  try {
    console.log("[getUserData] hit");

    if (!req.user) {
      console.log("[getUserData] ❌ no req.user");
      return res.status(401).json({ message: "Not authorized" });
    }

    // fetch by email if you want (or by userId if you add it to schema later)
    const email = req.user?.email;

    const found = await UserDataModel.findOne({
      email: String(email || "").toLowerCase().trim(),
    });

    return res.status(200).json({ data: found || null });
  } catch (err) {
    console.error("[getUserData] ❌ error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};