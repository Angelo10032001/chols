import express from "express";
import User from "../models/User.js";
import TimeLog from "../models/Logs.js";

const router = express.Router();

router.post("/tap", async (req, res) => {
  const { rfid } = req.body;

  try {
    const user = await User.findOne({ rfid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();

    // 🔴 MEMBERSHIP CHECK
    if (!user.membershipEnd || now > user.membershipEnd) {
      user.membershipStatus = "expired";
      await user.save();

      return res.status(403).json({
        success: false,
        message: "Membership expired"
      });
    }

    // CHECK ACTIVE SESSION
    const active = await TimeLog.findOne({
      rfid,
      action: "start",
      sessionClosed: false
    });

    // ---------------- START SESSION ----------------
    if (!active) {
      await new TimeLog({
        userId: user._id,
        rfid,
        action: "start",
        sessionClosed: false,
        timestamp: now
      }).save();

      return res.json({
        success: true,
        action: "start",
        message: "Check-in successful"
      });
    }

    // ---------------- END SESSION ----------------
    active.sessionClosed = true;
    await active.save();

    await new TimeLog({
      userId: user._id,
      rfid,
      action: "end",
      sessionClosed: true,
      timestamp: now
    }).save();

    return res.json({
      success: true,
      action: "end",
      message: "Check-out successful"
    });

  } catch (err) {
    console.error("RFID ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
