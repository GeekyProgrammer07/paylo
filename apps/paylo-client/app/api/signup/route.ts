import bcrypt from "bcrypt";
import prisma from "@paylo/db/client";
import * as z from "zod";
import { SignupSchema } from "@paylo/types";
import Randomstring from "randomstring";

export async function POST(req: Request) {
  const parsedInputs = SignupSchema.safeParse(await req.json());
  if (!parsedInputs.success) {
    const errors = z.treeifyError(parsedInputs.error);
    return Response.json({ errors }, { status: 400 });
  }

  const { name, phone, email, password } = parsedInputs.data;

  const existingUser = await prisma.user.findFirst({
    where: { number: phone },
  });

  if (existingUser) {
    return Response.json({ error: "User Already exists" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const amount =
    (Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000) * 100;

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        number: phone,
        email,
        password: hashed,
      },
    });

    await tx.onRampTransaction.create({
      data: {
        uuid: String(user.uuid),
        status: "Success",
        token: Randomstring.generate({ length: 10 }),
        provider: "Axis Bank",
        amount,
        startTime: new Date(),
        userId: user.id,
      },
    });

    await tx.balance.create({
      data: {
        userId: user.id,
        balance: amount,
        locked: 0,
      },
    });
  });

  return Response.json({ success: true });
}
