import mongoose from "mongoose";

const PromoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  days: { type: Number, required: true }
});

export default mongoose.model("Promo", PromoSchema);
