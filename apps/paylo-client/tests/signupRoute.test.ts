import { beforeEach, describe, expect, it, vi } from "vitest";

const { txMock, prismaMock, hashMock, generateMock } = vi.hoisted(() => {
  const txMock = {
    user: { create: vi.fn() },
    onRampTransaction: { create: vi.fn() },
    balance: { create: vi.fn() },
  };
  const prismaMock = {
    user: { findFirst: vi.fn() },
    $transaction: vi.fn(
      async (callback: (tx: typeof txMock) => Promise<unknown>) =>
        callback(txMock)
    ),
  };
  return {
    txMock,
    prismaMock,
    hashMock: vi.fn(),
    generateMock: vi.fn(),
  };
});

vi.mock("@paylo/db/client", () => ({ default: prismaMock }));
vi.mock("bcrypt", () => ({ default: { hash: hashMock } }));
vi.mock("randomstring", () => ({ default: { generate: generateMock } }));

import { OPTIONS, POST } from "../app/api/signup/route";

const VALID_BODY = {
  name: "John Doe",
  phone: "9876543210",
  email: "john@example.com",
  password: "secret123",
};

const CREATED_USER = {
  id: 1,
  uuid: "uuid-1",
  name: "John Doe",
  number: "9876543210",
  email: "john@example.com",
  password: "hashed-password",
};

function signupRequest(body: unknown): Request {
  return new Request("http://localhost/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.user.findFirst.mockResolvedValue(null);
  hashMock.mockResolvedValue("hashed-password");
  generateMock.mockReturnValue("tok1234567");
  txMock.user.create.mockResolvedValue(CREATED_USER);
  txMock.onRampTransaction.create.mockResolvedValue({ id: 1 });
  txMock.balance.create.mockResolvedValue({ userId: 1 });
});

describe("POST /api/signup", () => {
  describe("validation", () => {
    it("responds 400 with an error tree for an empty body", async () => {
      const res = await POST(signupRequest({}));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.errors).toBeDefined();
      expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    });

    it("responds 400 for a phone number that is not 10 digits", async () => {
      const res = await POST(
        signupRequest({ ...VALID_BODY, phone: "12345" })
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.errors.properties.phone.errors).toContain(
        "Phone number must be 10 digits"
      );
    });

    it("responds 400 for a malformed email", async () => {
      const res = await POST(
        signupRequest({ ...VALID_BODY, email: "not-an-email" })
      );

      expect(res.status).toBe(400);
    });

    it("responds 400 for a password shorter than 5 characters", async () => {
      const res = await POST(
        signupRequest({ ...VALID_BODY, password: "1234" })
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.errors.properties.password.errors).toContain(
        "Minimum Length is 5"
      );
    });
  });

  describe("duplicate users", () => {
    it("responds 400 when the phone number is already registered", async () => {
      prismaMock.user.findFirst.mockResolvedValue(CREATED_USER);

      const res = await POST(signupRequest(VALID_BODY));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toEqual({ error: "User Already exists" });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("successful signup", () => {
    it("responds 200 with { success: true }", async () => {
      const res = await POST(signupRequest(VALID_BODY));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true });
    });

    it("stores a bcrypt hash, never the plain-text password", async () => {
      await POST(signupRequest(VALID_BODY));

      expect(hashMock).toHaveBeenCalledWith("secret123", 10);
      expect(txMock.user.create).toHaveBeenCalledWith({
        data: {
          name: "John Doe",
          number: "9876543210",
          email: "john@example.com",
          password: "hashed-password",
        },
      });
    });

    it("seeds a welcome onramp and a matching balance in one transaction", async () => {
      await POST(signupRequest(VALID_BODY));

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

      const onrampData = txMock.onRampTransaction.create.mock.calls[0]![0].data;
      expect(onrampData).toMatchObject({
        uuid: "uuid-1",
        status: "Success",
        token: "tok1234567",
        provider: "Axis Bank",
        userId: 1,
      });

      const balanceData = txMock.balance.create.mock.calls[0]![0].data;
      expect(balanceData).toMatchObject({ userId: 1, locked: 0 });
      // The seeded balance must equal the seeded onramp amount.
      expect(balanceData.balance).toBe(onrampData.amount);
    });

    it("seeds a random balance between ₹10,000 and ₹1,00,000 (stored in paise)", async () => {
      await POST(signupRequest(VALID_BODY));

      const { balance } = txMock.balance.create.mock.calls[0]![0].data;
      expect(balance).toBeGreaterThanOrEqual(10000 * 100);
      expect(balance).toBeLessThanOrEqual(100000 * 100);
      expect(balance % 100).toBe(0);
    });

    it("sets CORS headers on the response", async () => {
      const res = await POST(signupRequest(VALID_BODY));

      expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
      expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    });
  });
});

describe("OPTIONS /api/signup", () => {
  it("responds 204 with CORS headers for preflight", async () => {
    const res = await OPTIONS();

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain(
      "Content-Type"
    );
  });
});
