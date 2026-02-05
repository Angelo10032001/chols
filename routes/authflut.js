import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    // Plain-text match (as requested)
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // ✅ RETURN ALL REQUIRED FIELDS FOR FLUTTER
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture || "",
      rfid: user.rfid || null,
      membershipStatus: user.membershipStatus || "expired",
      membershipEnd: user.membershipEnd || null,
    });

  } catch (err) {
    console.error("Flutter login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
