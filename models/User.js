import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  rfid: String,
  picture: String,

  membershipStart: {
    type: Date,
    default: null
  },

  membershipEnd: {
    type: Date,
    default: null
  },

  // prevents multiple deductions per day
  lastAttendanceDate: {
    type: String, // YYYY-MM-DD
    default: null
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
