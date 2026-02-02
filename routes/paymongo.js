import express from "express";
import crypto from "crypto";
import axios from "axios";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

/* ================= CREATE CHECKOUT ================= */
router.post("/create-checkout", async (req, res) => {
  const { amount, days, method, rfid } = req.body;

  const payload = {
    data: {
      attributes: {
        payment_method_types: [method],
        amount: amount * 100,
        currency: "PHP",
        description: `${days} Days Membership`,
        success_url: "https://your-success-url.com",
        cancel_url: "https://your-cancel-url.com",
        metadata: { rfid, days, amount, method }
      }
    }
  };

  const response = await axios.post(
    "https://api.paymongo.com/v1/checkout_sessions",
    payload,
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64"),
        "Content-Type": "application/json"
      }
    }
  );

  res.json({
    checkout_url: response.data.data.attributes.checkout_url
  });
});

/* ================= WEBHOOK ================= */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["paymongo-signature"];
    const raw = req.body.toString();
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET;

    const timestamp = sig.match(/t=(\d+)/)?.[1];
    const signature = sig.match(/li=([a-f0-9]+)/)?.[1];

    const signedPayload = `${timestamp}.${raw}`;
    const computed = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    if (computed !== signature) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(raw);
    const meta = event.data.attributes.data.attributes.metadata;

    if (event.data.attributes.type === "checkout_session.payment.paid") {
      const user = await User.findOne({ rfid: meta.rfid });
      if (!user) return res.sendStatus(200);

      const today = new Date();
      const daysMs = meta.days * 86400000;

      if (!user.membershipEnd || user.membershipEnd < today) {
        user.membershipStart = today;
        user.membershipEnd = new Date(today.getTime() + daysMs);
      } else {
        user.membershipEnd = new Date(
          user.membershipEnd.getTime() + daysMs
        );
      }

      user.membershipStatus = "active";
      await user.save();

      await Transaction.create({
        userId: user._id,
        rfid: meta.rfid,
        amount: meta.amount,
        days: meta.days,
        method: meta.method
      });
    }

    res.sendStatus(200);
  }
);

export default router;
