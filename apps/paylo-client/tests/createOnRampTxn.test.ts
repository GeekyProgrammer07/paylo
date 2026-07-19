import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getServerSessionMock, generateMock } = vi.hoisted(() => ({
  prismaMock: {
    onRampTransaction: { create: vi.fn() },
  },
  getServerSessionMock: vi.fn(),
  generateMock: vi.fn(),
}));

vi.mock("@paylo/db/client", () => ({ default: prismaMock }));
vi.mock("next-auth", () => ({ getServerSession: getServerSessionMock }));
vi.mock("../app/lib/auth", () => ({ authOptions: {} }));
vi.mock("randomstring", () => ({ default: { generate: generateMock } }));

import { createOnRampTransaction } from "../app/lib/actions/createOnRampTxn";

const SESSION = {
  user: { id: "uuid-1", dbId: 1, number: "9876543210" },
};

beforeEach(() => {
  vi.clearAllMocks();
  getServerSessionMock.mockResolvedValue(SESSION);
  generateMock.mockReturnValue("tok1234567");
  prismaMock.onRampTransaction.create.mockResolvedValue({ id: 1 });
});

describe("createOnRampTransaction", () => {
  it("refuses when the user is not logged in", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const result = await createOnRampTransaction(500, "HDFC Bank");

    expect(result).toEqual({ message: "User not Logged in" });
    expect(prismaMock.onRampTransaction.create).not.toHaveBeenCalled();
  });

  it("refuses when the session user has no dbId", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "uuid-1" } });

    const result = await createOnRampTransaction(500, "HDFC Bank");

    expect(result).toEqual({ message: "User not Logged in" });
  });

  it("creates a Processing transaction with a 10-char random token", async () => {
    await createOnRampTransaction(500, "HDFC Bank");

    expect(generateMock).toHaveBeenCalledWith({ length: 10 });
    expect(prismaMock.onRampTransaction.create).toHaveBeenCalledExactlyOnceWith({
      data: {
        uuid: "uuid-1",
        status: "Processing",
        token: "tok1234567",
        provider: "HDFC Bank",
        amount: 500,
        startTime: expect.any(Date),
        userId: 1,
      },
    });
  });

  it("stores the provider it was called with", async () => {
    await createOnRampTransaction(1000, "Axis Bank");

    expect(prismaMock.onRampTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ provider: "Axis Bank", amount: 1000 }),
      })
    );
  });
});
