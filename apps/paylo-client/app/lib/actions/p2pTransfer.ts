"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@paylo/db/client";

export const p2pTransfer = async (to: string, amount: number) => {
  try {
    const session = await getServerSession(authOptions);
    const fromUser = session?.user;

    if (!fromUser?.dbId) {
      return {
        ok: false,
        message: "Error while sending",
      };
    }

    const toUser = await prisma.user.findFirst({
      where: {
        number: to,
      },
    });

    if (!toUser) {
      return {
        ok: false,
        message: "User not found",
      };
    }

    // Interactive Transaction
    await prisma.$transaction(async (tx) => {
      // Locking: SELECT * FROM kv WHERE k = 1 FOR UPDATE;
      const sender = await tx.balance.update({
        data: {
          balance: {
            decrement: amount * 100,
          },
        },
        where: {
          userId: Number(fromUser.dbId),
        },
      });

      if (sender.balance < 0) {
        throw new Error("Insufficient balance");
      }

      await tx.balance.update({
        data: {
          balance: {
            increment: amount * 100,
          },
        },
        where: {
          userId: toUser.id,
        },
      });

      await tx.p2pTransfer.create({
        data: {
          amount: amount * 100,
          timestamp: new Date(),
          fromUserId: Number(fromUser.dbId),
          toUserId: toUser.id,
        },
      });
    });

    return {
      ok: true,
      message: "Transfer successful",
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        ok: false,
        message: err.message,
      };
    }
    return {
      ok: false,
      message: "Transaction failed",
    };
  }
};
