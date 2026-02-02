const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rfid: { type: String, unique: true },
  picture: String,

  membershipStart: Date,
  membershipEnd: Date,
  membershipStatus: {
    type: String,
    enum: ["active", "expired"],
    default: "expired"
  },

  createdAt: { type: Date, default: Date.now }
});
