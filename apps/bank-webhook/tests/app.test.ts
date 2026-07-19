import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The prisma client is mocked so no database is required. `$transaction`
// runs its callback against `txMock`, letting each test script the
// behaviour of `onRampTransaction.updateMany` and `balance.update`.
const { txMock, prismaMock } = vi.hoisted(() => {
  const txMock = {
    onRampTransaction: {
      updateMany: vi.fn(),
    },
    balance: {
      update: vi.fn(),
    },
  };
  const prismaMock = {
    $transaction: vi.fn(
      async (callback: (tx: typeof txMock) => Promise<unknown>) =>
        callback(txMock)
    ),
  };
  return { txMock, prismaMock };
});

vi.mock("@paylo/db/client", () => ({ default: prismaMock }));

import app from "../src/app";

const VALID_PAYLOAD = {
  token: "abcde12345", // exactly 10 chars, as the schema requires
  userId: 42,
  amount: 500,
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default to the happy path; individual tests override as needed.
  txMock.onRampTransaction.updateMany.mockResolvedValue({ count: 1 });
  txMock.balance.update.mockResolvedValue({ userId: 42, balance: 50000 });
});

describe("GET /", () => {
  it("responds 200 with a greeting", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.text).toBe("Hey there");
  });
});

describe("POST /createTransfer", () => {
  it("responds 200 with the placeholder body", async () => {
    const res = await request(app).post("/createTransfer").send({});

    expect(res.status).toBe(200);
    expect(res.text).toBe("Hello");
  });
});

describe("POST /hdfcWebhook", () => {
  describe("payload validation", () => {
    it("rejects an empty body with 400 and a structured error tree", async () => {
      const res = await request(app).post("/hdfcWebhook").send({});

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.properties.token).toBeDefined();
      expect(res.body.errors.properties.userId).toBeDefined();
      expect(res.body.errors.properties.amount).toBeDefined();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it("rejects a token that is not exactly 10 characters", async () => {
      const res = await request(app)
        .post("/hdfcWebhook")
        .send({ ...VALID_PAYLOAD, token: "short" });

      expect(res.status).toBe(400);
      expect(res.body.errors.properties.token.errors).toContain(
        "Token length is incorrect"
      );
    });

    it("trims surrounding whitespace before checking token length", async () => {
      const res = await request(app)
        .post("/hdfcWebhook")
        .send({ ...VALID_PAYLOAD, token: "  abcde12345  " });

      expect(res.status).toBe(200);
      expect(txMock.onRampTransaction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ token: "abcde12345" }),
        })
      );
    });

    it("rejects an amount below the 100 minimum", async () => {
      const res = await request(app)
        .post("/hdfcWebhook")
        .send({ ...VALID_PAYLOAD, amount: 99 });

      expect(res.status).toBe(400);
      expect(res.body.errors.properties.amount.errors).toContain(
        "Amount must be at least 100"
      );
    });

    it("rejects a non-numeric amount", async () => {
      const res = await request(app)
        .post("/hdfcWebhook")
        .send({ ...VALID_PAYLOAD, amount: "500" });

      expect(res.status).toBe(400);
      expect(res.body.errors.properties.amount).toBeDefined();
    });

    it("rejects a non-numeric userId", async () => {
      const res = await request(app)
        .post("/hdfcWebhook")
        .send({ ...VALID_PAYLOAD, userId: "42" });

      expect(res.status).toBe(400);
      expect(res.body.errors.properties.userId).toBeDefined();
    });

    it("never touches the database when validation fails", async () => {
      await request(app).post("/hdfcWebhook").send({ token: "bad" });

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(txMock.onRampTransaction.updateMany).not.toHaveBeenCalled();
      expect(txMock.balance.update).not.toHaveBeenCalled();
    });
  });

  describe("successful capture", () => {
    it("responds 200 with { message: 'Captured' }", async () => {
      const res = await request(app).post("/hdfcWebhook").send(VALID_PAYLOAD);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Captured" });
    });

    it("flips the matching Processing transaction to Success", async () => {
      await request(app).post("/hdfcWebhook").send(VALID_PAYLOAD);

      expect(txMock.onRampTransaction.updateMany).toHaveBeenCalledExactlyOnceWith({
        where: { token: "abcde12345", status: "Processing" },
        data: { status: "Success" },
      });
    });

    it("credits the user's balance in paise (amount * 100)", async () => {
      await request(app).post("/hdfcWebhook").send(VALID_PAYLOAD);

      expect(txMock.balance.update).toHaveBeenCalledExactlyOnceWith({
        where: { userId: 42 },
        data: { balance: { increment: 50000 } },
      });
    });

    it("runs status update and balance credit inside a single transaction", async () => {
      await request(app).post("/hdfcWebhook").send(VALID_PAYLOAD);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe("idempotency", () => {
    it("responds 409 when no Processing transaction matches the token", async () => {
      txMock.onRampTransaction.updateMany.mockResolvedValue({ count: 0 });

      const res = await request(app).post("/hdfcWebhook").send(VALID_PAYLOAD);

      expect(res.status).toBe(409);
      expect(res.text).toBe("Payment already processed");
    });

    it("does not credit the balance on a duplicate webhook", async () => {
      txMock.onRampTransaction.updateMany.mockResolvedValue({ count: 0 });

      await request(app).post("/hdfcWebhook").send(VALID_PAYLOAD);

      expect(txMock.balance.update).not.toHaveBeenCalled();
    });
  });

  describe("failure handling", () => {
    it("responds 500 when the balance update throws", async () => {
      txMock.balance.update.mockRejectedValue(new Error("db connection lost"));

      const res = await request(app).post("/hdfcWebhook").send(VALID_PAYLOAD);

      expect(res.status).toBe(500);
      expect(res.text).toBe("Internal Server Error");
    });

    it("responds 500 when the transaction rejects with a non-Error value", async () => {
      prismaMock.$transaction.mockRejectedValueOnce("string failure");

      const res = await request(app).post("/hdfcWebhook").send(VALID_PAYLOAD);

      expect(res.status).toBe(500);
      expect(res.text).toBe("Internal Server Error");
    });
  });
});
