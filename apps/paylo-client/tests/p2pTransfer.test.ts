import { beforeEach, describe, expect, it, vi } from "vitest";

const { txMock, prismaMock, getServerSessionMock } = vi.hoisted(() => {
  const txMock = {
    balance: { update: vi.fn() },
    p2pTransfer: { create: vi.fn() },
  };
  const prismaMock = {
    user: { findFirst: vi.fn() },
    $transaction: vi.fn(
      async (callback: (tx: typeof txMock) => Promise<unknown>) =>
        callback(txMock)
    ),
  };
  return { txMock, prismaMock, getServerSessionMock: vi.fn() };
});

vi.mock("@paylo/db/client", () => ({ default: prismaMock }));
vi.mock("next-auth", () => ({ getServerSession: getServerSessionMock }));
// authOptions pulls in providers/prisma/bcrypt; the transfer logic never
// reads it, so stub the whole module out.
vi.mock("../app/lib/auth", () => ({ authOptions: {} }));

import { p2pTransfer } from "../app/lib/actions/p2pTransfer";

const SESSION = {
  user: { id: "uuid-1", dbId: 1, number: "9876543210" },
};
const TO_USER = { id: 2, uuid: "uuid-2", number: "9123456789" };

beforeEach(() => {
  vi.clearAllMocks();
  // Happy-path defaults; tests override what they need.
  getServerSessionMock.mockResolvedValue(SESSION);
  prismaMock.user.findFirst.mockResolvedValue(TO_USER);
  txMock.balance.update.mockResolvedValue({ userId: 1, balance: 10000 });
  txMock.p2pTransfer.create.mockResolvedValue({ id: 1 });
});

describe("p2pTransfer", () => {
  describe("authentication", () => {
    it("fails when there is no session", async () => {
      getServerSessionMock.mockResolvedValue(null);

      const result = await p2pTransfer("9123456789", 100);

      expect(result).toEqual({ ok: false, message: "Error while sending" });
      expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it("fails when the session user has no dbId", async () => {
      getServerSessionMock.mockResolvedValue({ user: { id: "uuid-1" } });

      const result = await p2pTransfer("9123456789", 100);

      expect(result).toEqual({ ok: false, message: "Error while sending" });
    });
  });

  describe("recipient lookup", () => {
    it("looks the recipient up by phone number", async () => {
      await p2pTransfer("9123456789", 100);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { number: "9123456789" },
      });
    });

    it("fails without touching balances when the recipient does not exist", async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      const result = await p2pTransfer("0000000000", 100);

      expect(result).toEqual({ ok: false, message: "User not found" });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("successful transfer", () => {
    it("returns ok with a success message", async () => {
      const result = await p2pTransfer("9123456789", 100);

      expect(result).toEqual({ ok: true, message: "Transfer successful" });
    });

    it("debits the sender and credits the recipient in paise", async () => {
      await p2pTransfer("9123456789", 250);

      expect(txMock.balance.update).toHaveBeenNthCalledWith(1, {
        data: { balance: { decrement: 25000 } },
        where: { userId: 1 },
      });
      expect(txMock.balance.update).toHaveBeenNthCalledWith(2, {
        data: { balance: { increment: 25000 } },
        where: { userId: 2 },
      });
    });

    it("records the transfer with amount in paise and both user ids", async () => {
      await p2pTransfer("9123456789", 250);

      expect(txMock.p2pTransfer.create).toHaveBeenCalledExactlyOnceWith({
        data: {
          amount: 25000,
          timestamp: expect.any(Date),
          fromUserId: 1,
          toUserId: 2,
        },
      });
    });

    it("performs all three writes inside a single transaction", async () => {
      await p2pTransfer("9123456789", 100);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe("insufficient balance", () => {
    it("aborts when the sender's balance would go negative", async () => {
      txMock.balance.update.mockResolvedValueOnce({ userId: 1, balance: -5000 });

      const result = await p2pTransfer("9123456789", 100);

      expect(result).toEqual({ ok: false, message: "Insufficient balance" });
      // The recipient credit and the transfer record must not happen.
      expect(txMock.balance.update).toHaveBeenCalledTimes(1);
      expect(txMock.p2pTransfer.create).not.toHaveBeenCalled();
    });
  });

  describe("database failures", () => {
    it("surfaces the error message when the transaction throws an Error", async () => {
      prismaMock.$transaction.mockRejectedValueOnce(
        new Error("deadlock detected")
      );

      const result = await p2pTransfer("9123456789", 100);

      expect(result).toEqual({ ok: false, message: "deadlock detected" });
    });

    it("falls back to a generic message for non-Error throws", async () => {
      prismaMock.$transaction.mockRejectedValueOnce("weird failure");

      const result = await p2pTransfer("9123456789", 100);

      expect(result).toEqual({ ok: false, message: "Transaction failed" });
    });
  });
});
