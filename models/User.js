import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rfid: { type: String, unique: true },
  picture: String,

  membershipStart: Date,
  membershipEnd: Date,
  lastAttendanceDate: {
  type: String, // YYYY-MM-DD
  default: null
  },
  membershipStatus: {
    type: String,
    enum: ["active", "expired"],
    default: "expired"
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
