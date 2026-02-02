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

    // last history for this RFID
    const lastLog = await History.findOne({ rfid }).sort({ timestamp: -1 });

    let action = "start";
    let duration = 0;

    // TAP AGAIN → CHECK-OUT
    if (lastLog && lastLog.action === "start") {
      action = "end";

      // compute duration in seconds
      duration = Math.floor((now - lastLog.timestamp) / 1000);
    }

    // SAVE HISTORY
    await History.create({
      rfid,
      userId: user._id,
      action,
      timestamp: now,
      duration
    });

    // =============================
    // DAY DEDUCTION (ONLY ON FIRST IN OF THE DAY)
    // =============================
    if (action === "start") {
      const today = now.toISOString().split("T")[0];

      if (user.lastAttendanceDate !== today) {
        if (!user.membershipEnd) {
          return res.status(400).json({
            error: "User has no active membership"
          });
        }

        // deduct 1 day
        user.membershipEnd.setDate(user.membershipEnd.getDate() - 1);
        user.lastAttendanceDate = today;

        await user.save();
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
