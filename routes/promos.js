import express from "express";
import Promo from "../models/Promo.js";

const router = express.Router();

router.get("/", async (_, res) => {
  const promos = await Promo.find();
  res.json(promos);
});

router.post("/", async (req, res) => {
  const { price, days } = req.body;
  const name = `₱${price} for ${days} Days`;

  const promo = new Promo({ name, price, days });
  await promo.save();

  res.status(201).json(promo);
});

router.put("/:id", async (req, res) => {
  const { price, days } = req.body;
  const name = `₱${price} for ${days} Days`;

  const promo = await Promo.findByIdAndUpdate(
    req.params.id,
    { price, days, name },
    { new: true }
  );

  res.json(promo);
});

router.delete("/:id", async (req, res) => {
  await Promo.findByIdAndDelete(req.params.id);
  res.json({ message: "Promo deleted" });
});

export default router;
