import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
  rfid: { type: String, required: true },
  action: { type: String, enum: ["start", "end"], required: true },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 } // seconds (computed on end)
});

export default mongoose.model("History", HistorySchema);
