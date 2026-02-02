const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rfid: String,
  amount: Number,
  days: Number,
  method: String,
  createdAt: { type: Date, default: Date.now }
});
