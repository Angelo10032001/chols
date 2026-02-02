import express from "express";
import User from "../models/User.js";
import History from "../models/History.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { rfid } = req.body;
    if (!rfid) {
      return res.status(400).json({ success: false, message: "RFID required" });
    }

    const user = await User.findOne({ rfid });
    if (!user) {
      return res.json({
        success: false,
        allow: false,
        message: "RFID not registered"
      });
    }

    const now = new Date();
    if (!user.membershipEnd || user.membershipEnd < now) {
      return res.json({
        success: false,
        allow: false,
        message: "Membership expired"
      });
    }

    // Check last log
    const lastLog = await History.findOne({ rfid }).sort({ timestamp: -1 });

    let action = "start";
    if (lastLog && lastLog.action === "start") {
      action = "end";
    }

    await History.create({
      rfid,
      action,
      timestamp: now
    });

    return res.json({
      success: true,
      allow: true,
      name: user.name,
      action,
      message: action === "start" ? "Checked in" : "Checked out"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
