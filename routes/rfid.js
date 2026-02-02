import express from "express";
import User from "../models/User.js";
import History from "../models/History.js";

const router = express.Router();

/**
 * POST /api/rfid
 * body: { rfid: "7D 98 D3 06" }
 */
router.post("/", async (req, res) => {
  try {
    const { rfid } = req.body;
    if (!rfid) {
      return res.status(400).json({ error: "RFID required" });
    }

    const user = await User.findOne({ rfid });
    if (!user) {
      return res.status(404).json({ error: "RFID not registered" });
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const lastLog = await History.findOne({ rfid }).sort({ timestamp: -1 });

    let action = "start";
    let duration = 0;

    // =============================
    // CHECK-OUT LOGIC
    // =============================
    if (lastLog && lastLog.action === "start") {
      action = "end";
      duration = Math.floor((now - lastLog.timestamp) / 1000);
    }

    // =============================
    // PREVENT DOUBLE OUT
    // =============================
    if (lastLog && lastLog.action === "end" && action === "end") {
      return res.json({
        success: false,
        message: "Already checked out"
      });
    }

    // =============================
    // SAVE HISTORY
    // =============================
    await History.create({
      rfid,
      userId: user._id,
      action,
      timestamp: now,
      duration
    });

    // =============================
    // DAY DEDUCTION (ONLY ON FIRST IN)
    // =============================
    if (action === "start") {

      if (!user.membershipEnd) {
        return res.status(400).json({
          error: "No active membership"
        });
      }

      if (user.lastAttendanceDate !== today) {

        const endDate = new Date(user.membershipEnd);
        endDate.setDate(endDate.getDate() - 1);

        user.membershipEnd = endDate;
        user.lastAttendanceDate = today;

        await user.save();

        console.log("✅ DAY DEDUCTED:", user.name);
      } else {
        console.log("ℹ️ Already deducted today:", user.name);
      }
    }

    res.json({
      success: true,
      action,
      duration,
      message: action === "start" ? "Checked in" : "Checked out"
    });

  } catch (err) {
    console.error("RFID ERROR:", err);
    res.status(500).json({ error: "RFID processing failed" });
  }
});

export default router;
