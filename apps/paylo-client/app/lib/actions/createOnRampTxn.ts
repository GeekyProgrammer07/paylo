"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@paylo/db/client";
import randomstring from "randomstring";
import { createLogger } from "@paylo/logger";

const logger = createLogger({ service: "paylo-client" });

export const createOnRampTransaction = async (
  amount: number,
  provider: string
) => {
  const session = await getServerSession(authOptions);
  const token = randomstring.generate({ length: 10 });
  const userId = session?.user?.dbId;
  if (!userId) {
    return {
      message: "User not Logged in",
    };
  }
  await prisma.onRampTransaction.create({
    data: {
      uuid: String(session.user.id),
      status: "Processing",
      token,
      provider,
      amount,
      startTime: new Date(),
      userId: session.user.dbId,
    },
  });
  logger.info("OnRamp transaction created", {
    userId: session.user.dbId,
    provider,
    amount,
  });
};
