import prisma from "@paylo/db/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));

  const onramps = await prisma.onRampTransaction.findMany({
    where: { userId, status: "Success" },
    select: { amount: true, startTime: true },
  });

  const sent = await prisma.p2pTransfer.findMany({
    where: { fromUserId: userId },
    select: { amount: true, timestamp: true },
  });

  const received = await prisma.p2pTransfer.findMany({
    where: { toUserId: userId },
    select: { amount: true, timestamp: true },
  });

  const events = [
    ...onramps.map((o) => ({
      time: new Date(o.startTime),
      delta: o.amount / 100,
    })),
    ...sent.map((s) => ({
      time: new Date(s.timestamp),
      delta: -s.amount / 100,
    })),
    ...received.map((r) => ({
      time: new Date(r.timestamp),
      delta: r.amount / 100,
    })),
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  let balance = 0;
  const history = events.map((e) => {
    balance += e.delta;
    return {
      time: e.time.toISOString(),
      balance,
    };
  });

  return Response.json(history);
}
