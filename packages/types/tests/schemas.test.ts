import { describe, expect, it } from "vitest";
import {
  PaymentInformationSchema,
  SignupSchema,
  Status,
  TransactionSchema,
} from "../src";

function messagesOf(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues.map((i) => i.message) ?? [];
}

describe("SignupSchema", () => {
  const VALID_SIGNUP = {
    name: "John Doe",
    phone: "9876543210",
    email: "john@example.com",
    password: "secret123",
  };

  it("accepts a fully valid signup payload", () => {
    const result = SignupSchema.safeParse(VALID_SIGNUP);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(VALID_SIGNUP);
  });

  it("trims whitespace from name", () => {
    const result = SignupSchema.safeParse({
      ...VALID_SIGNUP,
      name: "  John Doe  ",
    });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("John Doe");
  });

  it("rejects a padded email: format is validated before .trim() runs", () => {
    const result = SignupSchema.safeParse({
      ...VALID_SIGNUP,
      email: "  john@example.com  ",
    });

    expect(result.success).toBe(false);
    expect(messagesOf(result)).toContain("Email Format is Incorrect");
  });

  describe("phone", () => {
    it.each([
      ["too short", "12345"],
      ["too long", "12345678901"],
      ["contains letters", "98765abcde"],
      ["contains spaces", "98765 4321"],
    ])("rejects a phone number that is %s", (_label, phone) => {
      const result = SignupSchema.safeParse({ ...VALID_SIGNUP, phone });

      expect(result.success).toBe(false);
      expect(messagesOf(result)).toContain("Phone number must be 10 digits");
    });
  });

  describe("email", () => {
    it.each(["not-an-email", "missing@tld", "@nodomain.com"])(
      "rejects invalid email %s",
      (email) => {
        const result = SignupSchema.safeParse({ ...VALID_SIGNUP, email });

        expect(result.success).toBe(false);
        expect(messagesOf(result)).toContain("Email Format is Incorrect");
      }
    );
  });

  describe("password", () => {
    it("rejects a password shorter than 5 characters", () => {
      const result = SignupSchema.safeParse({ ...VALID_SIGNUP, password: "1234" });

      expect(result.success).toBe(false);
      expect(messagesOf(result)).toContain("Minimum Length is 5");
    });

    it("accepts a password of exactly 5 characters", () => {
      const result = SignupSchema.safeParse({ ...VALID_SIGNUP, password: "12345" });

      expect(result.success).toBe(true);
    });
  });

  it("reports every missing field at once for an empty object", () => {
    const result = SignupSchema.safeParse({});

    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path[0]);
    expect(paths).toEqual(
      expect.arrayContaining(["name", "phone", "email", "password"])
    );
  });
});

describe("PaymentInformationSchema", () => {
  const VALID_PAYMENT = {
    token: "abcde12345",
    userId: 7,
    amount: 250,
  };

  it("accepts a valid payment payload", () => {
    const result = PaymentInformationSchema.safeParse(VALID_PAYMENT);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(VALID_PAYMENT);
  });

  describe("token", () => {
    it("requires exactly 10 characters", () => {
      for (const token of ["123456789", "12345678901", ""]) {
        const result = PaymentInformationSchema.safeParse({
          ...VALID_PAYMENT,
          token,
        });
        expect(result.success).toBe(false);
      }
    });

    it("trims before measuring length, so a padded 10-char token passes", () => {
      const result = PaymentInformationSchema.safeParse({
        ...VALID_PAYMENT,
        token: "  abcde12345  ",
      });

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe("abcde12345");
    });

    it("rejects a non-string token", () => {
      const result = PaymentInformationSchema.safeParse({
        ...VALID_PAYMENT,
        token: 1234567890,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("amount", () => {
    it("rejects amounts below 100", () => {
      const result = PaymentInformationSchema.safeParse({
        ...VALID_PAYMENT,
        amount: 99.99,
      });

      expect(result.success).toBe(false);
      expect(messagesOf(result)).toContain("Amount must be at least 100");
    });

    it("accepts the boundary amount of exactly 100", () => {
      const result = PaymentInformationSchema.safeParse({
        ...VALID_PAYMENT,
        amount: 100,
      });

      expect(result.success).toBe(true);
    });

    it("rejects a numeric string (no coercion)", () => {
      const result = PaymentInformationSchema.safeParse({
        ...VALID_PAYMENT,
        amount: "250",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("userId", () => {
    it("rejects a numeric string (no coercion)", () => {
      const result = PaymentInformationSchema.safeParse({
        ...VALID_PAYMENT,
        userId: "7",
      });

      expect(result.success).toBe(false);
    });
  });
});

describe("TransactionSchema", () => {
  const VALID_TRANSACTION = {
    transactions: {
      time: new Date("2026-01-01T00:00:00Z"),
      amount: 1000,
      status: Status.Success,
      provider: "HDFC Bank",
    },
  };

  it("accepts a valid transaction", () => {
    expect(TransactionSchema.safeParse(VALID_TRANSACTION).success).toBe(true);
  });

  it.each([Status.Success, Status.Processing, Status.Failure])(
    "accepts status %s",
    (status) => {
      const result = TransactionSchema.safeParse({
        transactions: { ...VALID_TRANSACTION.transactions, status },
      });

      expect(result.success).toBe(true);
    }
  );

  it("rejects an unknown status", () => {
    const result = TransactionSchema.safeParse({
      transactions: { ...VALID_TRANSACTION.transactions, status: "Pending" },
    });

    expect(result.success).toBe(false);
  });

  it("rejects a date passed as an ISO string (no coercion)", () => {
    const result = TransactionSchema.safeParse({
      transactions: {
        ...VALID_TRANSACTION.transactions,
        time: "2026-01-01T00:00:00Z",
      },
    });

    expect(result.success).toBe(false);
  });
});

describe("Status enum", () => {
  it("exposes the exact string values persisted in the database", () => {
    expect(Status.Success).toBe("Success");
    expect(Status.Processing).toBe("Processing");
    expect(Status.Failure).toBe("Failure");
  });
});
