import express from "express";
import dotenv from "dotenv";
import path from "path";
import prisma from "@paylo/db/client";
import { PaymentInformation } from "@paylo/types";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Hey there");
});

app.post("/createTransfer", (_, res) => {
  res.send("Hello");
});

app.post("/hdfcWebhook", async (req, res) => {
  //TODO: Add zod validation
  //TODO: HDFC should send us a secret to verify
  //TODO: Check for processing in db only then increase the balance
  const paymentInformation: PaymentInformation = {
    token: req.body.token,
    userId: req.body.userId,
    amount: req.body.amount,
  };
  try {
    await prisma.$transaction([
      prisma.balance.update({
        where: {
          userId: paymentInformation.userId,
        },
        data: {
          balance: {
            increment: Number(paymentInformation.amount * 100),
          },
        },
      }),
      prisma.onRampTransaction.updateMany({
        where: {
          token: paymentInformation.token,
        },
        data: {
          status: "Success",
        },
      }),
    ]);

    res.status(200).json({
      message: "Captured",
    });
  } catch (err) {
    console.error("Payment capture failed:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3003, () => {
  console.log("App is listening on 3003");
});
