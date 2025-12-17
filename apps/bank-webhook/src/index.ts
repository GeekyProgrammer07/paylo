import express from "express";
import dotenv from "dotenv";
import path from "path";
import prisma from "@paylo/db/client";
import { PaymentInformationSchema } from "@paylo/types";
import * as z from "zod";
import cors from "cors";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();

app.use(cors());
app.use(express.json());

console.log("Hi there");

app.get("/", (_, res) => {
  res.send("Hey there");
});

app.post("/createTransfer", (_, res) => {
  res.send("Hello");
});

app.post("/hdfcWebhook", async (req, res) => {
  const parsedInputs = await PaymentInformationSchema.safeParse(req.body);
  console.log(parsedInputs);
  if (!parsedInputs.success) {
    const errors = z.treeifyError(parsedInputs.error);
    return res.status(400).json({ errors });
  }

  const paymentInformation = parsedInputs.data;

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.onRampTransaction.updateMany({
        where: {
          token: paymentInformation.token,
          status: "Processing",
        },
        data: {
          status: "Success",
        },
      });

      if (updated.count === 0) {
        throw new Error("ALREADY_PROCESSED");
      }

      await tx.balance.update({
        where: { userId: paymentInformation.userId },
        data: {
          balance: { increment: Number(paymentInformation.amount * 100) },
        },
      });
    });

    res.status(200).json({
      message: "Captured",
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "ALREADY_PROCESSED") {
        return res.status(409).send("Payment already processed");
      }
    } else {
      console.error("Payment capture failed:", err);
    }
    return res.status(500).send("Internal Server Error");
  }
});

app.listen(3003, () => {
  console.log("App is listening on 3003");
});
