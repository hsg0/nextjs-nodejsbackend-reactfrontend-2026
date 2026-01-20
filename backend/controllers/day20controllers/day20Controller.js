import Day20Model from "../../models/day20models/day20Model.js";

/**
 * GET /web/api/day20/get-day20-data
 * Return only the current logged-in user's records
 */
export const getDay20Data = async (req, res) => {
  try {
    console.log("[Day20Controller] getDay20Data user:", req.user?.webUserId);

    const day20Data = await Day20Model.find({ webUserId: req.user.webUserId }).sort({
      createdAt: -1,
    });

    console.log("[Day20Controller] getDay20Data found:", day20Data.length);
    return res.status(200).json({ day20Data });
  } catch (err) {
    console.log("[Day20Controller] getDay20Data error:", err?.message, err);
    return res.status(500).json({ message: "Failed to fetch day20 data", error: err?.message });
  }
};

/**
 * POST /web/api/day20/set-day20-data
 * Creates a record and auto-attaches webUserId from req.user
 */
export const setDay20Data = async (req, res) => {
  try {
    console.log("[Day20Controller] setDay20Data body:", req.body);
    console.log("[Day20Controller] setDay20Data req.user:", req.user);

    // Basic checks to help debugging
    const required = ["firstName", "lastName", "email", "phoneNumber", "zipCode"];
    for (const key of required) {
      if (!req.body?.[key]) {
        return res.status(400).json({ message: `Missing required field: ${key}` });
      }
    }

    if (!req.body?.address?.line1 || !req.body?.address?.city || !req.body?.address?.province) {
      return res.status(400).json({
        message: "Missing required address fields (line1/city/province)",
      });
    }

    // ✅ attach the logged-in web user
    const payload = {
      ...req.body,
      webUserId: req.user.webUserId,
    };

    const created = await Day20Model.create(payload);

    console.log("[Day20Controller] setDay20Data created:", created._id);
    return res.status(201).json({ message: "Day20 record created", day20: created });
  } catch (err) {
    console.log("[Day20Controller] setDay20Data error:", err?.message, err);

    if (err?.code === 11000) {
      return res.status(409).json({
        message: "Email already exists (duplicate). Use a different email.",
        error: err?.message,
      });
    }

    return res.status(400).json({ message: "Failed to create day20 data", error: err?.message });
  }
};

/**
 * PUT /web/api/day20/update-day20-data/:id
 * Only allow update if the record belongs to this user
 */
export const updateDay20Data = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("[Day20Controller] updateDay20Data id:", id);
    console.log("[Day20Controller] updateDay20Data user:", req.user?.webUserId);
    console.log("[Day20Controller] updateDay20Data body:", req.body);

    // ✅ only update if owned by this user
    const updated = await Day20Model.findOneAndUpdate(
      { _id: id, webUserId: req.user.webUserId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Day20 record not found (or not owned by you)" });
    }

    console.log("[Day20Controller] updateDay20Data updated:", updated._id);
    return res.status(200).json({ message: "Day20 record updated", day20: updated });
  } catch (err) {
    console.log("[Day20Controller] updateDay20Data error:", err?.message, err);

    if (err?.code === 11000) {
      return res.status(409).json({
        message: "Email already exists (duplicate).",
        error: err?.message,
      });
    }

    return res.status(400).json({ message: "Failed to update day20 data", error: err?.message });
  }
};

/**
 * DELETE /web/api/day20/delete-day20-data/:id
 * Only allow delete if the record belongs to this user
 */
export const deleteDay20Data = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("[Day20Controller] deleteDay20Data id:", id);
    console.log("[Day20Controller] deleteDay20Data user:", req.user?.webUserId);

    // ✅ only delete if owned by this user
    const deleted = await Day20Model.findOneAndDelete({
      _id: id,
      webUserId: req.user.webUserId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Day20 record not found (or not owned by you)" });
    }

    console.log("[Day20Controller] deleteDay20Data deleted:", id);
    return res.status(200).json({ message: "Day20 record deleted", deletedId: id });
  } catch (err) {
    console.log("[Day20Controller] deleteDay20Data error:", err?.message, err);
    return res.status(400).json({ message: "Failed to delete day20 data", error: err?.message });
  }
};