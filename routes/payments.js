import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/create-checkout", async (req, res) => {
  try {
    const { amount, days, rfid } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------
    if (!amount || !days || !rfid) {
      return res.status(400).json({
        error: "amount, days, and rfid are required",
      });
    }

    // -----------------------------
    // PAYMONGO PAYLOAD (DAYS-BASED)
    // -----------------------------
    const payload = {
      data: {
        attributes: {
          payment_method_types: ["gcash"],
          success_url: "https://your-success-url.com",
          cancel_url: "https://your-cancel-url.com",
          line_items: [
            {
              name: `Membership Extension`,
              description: `${days} Days | RFID: ${rfid}`,
              amount: amount * 100, // centavos
              quantity: 1,
            },
          ],
          metadata: {
            rfid: String(rfid).trim(),
            days: Number(days),
            amount: Number(amount)
          }
        },
      },
    };

    console.log("Sending to PayMongo:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(process.env.PAYMONGO_SECRET + ":").toString("base64"),
        },
      }
    );

    return res.json({
      checkout_url: response.data.data.attributes.checkout_url,
    });

  } catch (error) {
    console.error("❌ PayMongo Error:", error.response?.data || error);
    return res.status(400).json(error.response?.data || error);
  }
});

export default router;
