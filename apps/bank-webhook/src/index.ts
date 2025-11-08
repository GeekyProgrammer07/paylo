import express from "express";
import dotenv from "dotenv";
import path from "path";
import prisma from "@paylo/db/client";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();

type PaymentInformation = {
  token: string;
  userId: string;
  amount: number;
};

app.get("/", (_, res) => {
  res.send("Hey there");
});

app.post("/createTransfer", (_, res) => {
  res.send("Hello");
});

app.post("/hdfcWebhook", async (req, res) => {
  //TODO: Add zod validation
  //TODO: HDFC should send us a secret to verify
  const paymentInformation: PaymentInformation = {
    token: req.body.token,
    userId: req.body.user_Id,
    amount: req.body.amount,
  };

  try {
    await prisma.$transaction([
      prisma.balance.update({
        where: {
          uuid: paymentInformation.userId,
        },
        data: {
          amount: {
            increment: Number(paymentInformation.amount),
          },
        },
      }),
      prisma.onRampTransaction.updateMany({
        where: {
          uuid: paymentInformation.userId,
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
