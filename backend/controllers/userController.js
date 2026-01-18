// nextjs-reactjs-practice-2026/backend/controllers/userController.js
import WebUserModel from "../models/webUserModel.js";

/* ----------------------------------------------------------
   GET ALL USERS
   GET /web/api/users/getallusers
---------------------------------------------------------- */
export const getAllUsers = async (req, res) => {
  try {
    const users = await WebUserModel.find({})
      .select("_id username email verifyAccount createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.log("❌ getAllUsers error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   GET USER BY EMAIL
   GET /web/api/users/getuserbyemail?email=someone@email.com
---------------------------------------------------------- */
export const getUserByEmail = async (req, res) => {
  try {
    const email = req?.query?.email;

    if (!email) {
      return res.status(400).json({ message: "email query param is required" });
    }

    const user = await WebUserModel.findOne({
      email: String(email).toLowerCase().trim(),
    }).select("_id username email verifyAccount createdAt updatedAt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.log("❌ getUserByEmail error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   GET USER BY ID
   GET /web/api/users/getuserbyid?id=OBJECT_ID
---------------------------------------------------------- */
export const getUserById = async (req, res) => {
  try {
    const id = req?.query?.id;

    if (!id) {
      return res.status(400).json({ message: "id query param is required" });
    }

    const user = await WebUserModel.findById(id).select(
      "_id username email verifyAccount createdAt updatedAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.log("❌ getUserById error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   UPDATE USER BY ID
   PUT /web/api/users/updateuserbyid?id=OBJECT_ID
   Body: { username?, email?, verifyAccount? }
---------------------------------------------------------- */
export const updateUserById = async (req, res) => {
  try {
    const id = req?.query?.id;

    if (!id) {
      return res.status(400).json({ message: "id query param is required" });
    }

    const { username, email, verifyAccount } = req.body;

    const updates = {};

    if (typeof username === "string" && username.trim()) {
      updates.username = username.trim();
    }

    if (typeof email === "string" && email.trim()) {
      updates.email = email.toLowerCase().trim();
    }

    if (typeof verifyAccount === "boolean") {
      updates.verifyAccount = verifyAccount;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update (username, email, verifyAccount)",
      });
    }

    const updated = await WebUserModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("_id username email verifyAccount createdAt updatedAt");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updated,
    });
  } catch (error) {
    console.log("❌ updateUserById error:", error?.message || error);

    // Duplicate email error (Mongo unique index)
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   DELETE USER BY ID
   DELETE /web/api/users/deleteuserbyid?id=OBJECT_ID
---------------------------------------------------------- */
export const deleteUserById = async (req, res) => {
  try {
    const id = req?.query?.id;

    if (!id) {
      return res.status(400).json({ message: "id query param is required" });
    }

    const deleted = await WebUserModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("❌ deleteUserById error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};