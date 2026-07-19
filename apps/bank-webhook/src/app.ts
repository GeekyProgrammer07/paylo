import express from "express";
import prisma from "@paylo/db/client";
import { PaymentInformationSchema } from "@paylo/types";
import * as z from "zod";
import cors from "cors";
import { createLogger, errorMeta } from "@paylo/logger";

export const logger = createLogger({ service: "bank-webhook" });

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Hey there");
});

app.post("/createTransfer", (_, res) => {
  res.send("Hello");
});

app.post("/hdfcWebhook", async (req, res) => {
  const parsedInputs = await PaymentInformationSchema.safeParse(req.body);
  if (!parsedInputs.success) {
    logger.warn("Webhook payload failed validation", {
      issues: parsedInputs.error.issues.map((i) => i.message),
    });
    const errors = z.treeifyError(parsedInputs.error);
    return res.status(400).json({ errors });
  }

  const paymentInformation = parsedInputs.data;
  const requestLogger = logger.child({
    token: paymentInformation.token,
    userId: paymentInformation.userId,
  });

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

    requestLogger.info("Payment captured", {
      amount: paymentInformation.amount,
    });
    res.status(200).json({
      message: "Captured",
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "ALREADY_PROCESSED") {
      requestLogger.warn("Duplicate webhook: payment already processed");
      return res.status(409).send("Payment already processed");
    }
    requestLogger.error("Payment capture failed", errorMeta(err));
    return res.status(500).send("Internal Server Error");
  }
});

export default app;
