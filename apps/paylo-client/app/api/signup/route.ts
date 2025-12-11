import bcrypt from "bcrypt";
import prisma from "@paylo/db/client";

export async function POST(req: Request) {
  // TODO: Add Zod
  // TODO: After Zod have error response like { error: "User exists" }
  // TODO: Give user some money
  const { name, phone, email, password } = await req.json();

  const existingUser = await prisma.user.findFirst({
    where: {
      number: phone,
    },
  });

  if (existingUser) {
    return Response.json({ error: "User Already exists" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      number: phone,
      email,
      password: hashed,
    },
  });

  return Response.json({
    success: true,
  });
}
