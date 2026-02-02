import express from "express";
import History from "../models/History.js";

const router = express.Router();

router.get("/allhistory", async (req, res) => {
  try {
    const logs = await History.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch time logs" });
  }
});

export default router;
