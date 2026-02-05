import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const now = new Date();

    const hasMembership =
      user.membershipStart && user.membershipEnd &&
      now >= user.membershipStart &&
      now <= user.membershipEnd;

    const remainingDays = hasMembership
      ? Math.ceil(
          (new Date(user.membershipEnd).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture || "",
      rfid: user.rfid || null,

      // 🔥 DERIVED FIELDS
      membershipActive: hasMembership,
      membershipStart: user.membershipStart || null,
      membershipEnd: user.membershipEnd || null,
      remainingDays,
    });

  } catch (err) {
    console.error("Flutter login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
