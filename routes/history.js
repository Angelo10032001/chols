import express from "express";
import History from "../models/History.js";

const router = express.Router();

router.get("/allhistory", async (req, res) => {
  try {
    const logs = await History.find()
      .populate("userId", "name email")
      .sort({ timestamp: -1 });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

export default router;
