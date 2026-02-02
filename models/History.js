import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  rfid: {
    type: String,
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  action: {
    type: String,
    enum: ["start", "end"],
    required: true
  },

  timestamp: {
    type: Date,
    default: Date.now
  },

  // duration in SECONDS (only on OUT)
  duration: {
    type: Number,
    default: 0
  }
});

export default mongoose.model("History", historySchema);
