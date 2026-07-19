import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, compareMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findFirst: vi.fn() },
  },
  compareMock: vi.fn(),
}));

vi.mock("@paylo/db/client", () => ({ default: prismaMock }));
vi.mock("bcrypt", () => ({ default: { compare: compareMock } }));

import { authOptions } from "../app/lib/auth";

const DB_USER = {
  id: 1,
  uuid: "uuid-1",
  name: "John Doe",
  number: "9876543210",
  email: "john@example.com",
  password: "hashed-password",
};

// next-auth v4 keeps the user-supplied config on provider.options.
function getAuthorize() {
  const provider = authOptions.providers[0] as unknown as {
    authorize?: (credentials: unknown) => Promise<unknown>;
    options?: { authorize?: (credentials: unknown) => Promise<unknown> };
  };
  const authorize = provider.options?.authorize ?? provider.authorize;
  if (!authorize) throw new Error("authorize callback not found on provider");
  return authorize;
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.user.findFirst.mockResolvedValue(DB_USER);
  compareMock.mockResolvedValue(true);
});

describe("credentials authorize()", () => {
  it("returns the mapped user for valid credentials", async () => {
    const user = await getAuthorize()({
      phone: "9876543210",
      password: "secret123",
    });

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { number: "9876543210" },
    });
    expect(compareMock).toHaveBeenCalledWith("secret123", "hashed-password");
    expect(user).toEqual({
      id: "uuid-1",
      dbId: 1,
      name: "John Doe",
      email: "john@example.com",
      number: "9876543210",
    });
  });

  it("returns null when no user matches the phone number", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    const user = await getAuthorize()({
      phone: "0000000000",
      password: "secret123",
    });

    expect(user).toBeNull();
    expect(compareMock).not.toHaveBeenCalled();
  });

  it("returns null when the password does not match", async () => {
    compareMock.mockResolvedValue(false);

    const user = await getAuthorize()({
      phone: "9876543210",
      password: "wrong-password",
    });

    expect(user).toBeNull();
  });

  it("returns null instead of throwing when the database errors", async () => {
    prismaMock.user.findFirst.mockRejectedValue(new Error("db down"));

    const user = await getAuthorize()({
      phone: "9876543210",
      password: "secret123",
    });

    expect(user).toBeNull();
  });
});

describe("jwt callback", () => {
  const jwt = authOptions.callbacks.jwt;

  it("copies id, dbId and number onto the token at sign-in", async () => {
    const token = await jwt({
      token: { sub: "abc" } as never,
      user: { id: "uuid-1", dbId: 1, number: "9876543210" },
    });

    expect(token).toMatchObject({
      sub: "abc",
      id: "uuid-1",
      dbId: 1,
      number: "9876543210",
    });
  });

  it("leaves the token untouched on subsequent calls without a user", async () => {
    const existing = {
      sub: "abc",
      id: "uuid-1",
      dbId: 1,
      number: "9876543210",
    } as never;

    const token = await jwt({ token: existing });

    expect(token).toEqual(existing);
  });
});

describe("session callback", () => {
  it("exposes id, dbId and number on session.user", async () => {
    const session = await authOptions.callbacks.session({
      session: { user: {} } as never,
      token: { id: "uuid-1", dbId: 1, number: "9876543210" } as never,
    });

    expect(session.user).toMatchObject({
      id: "uuid-1",
      dbId: 1,
      number: "9876543210",
    });
  });
});

describe("redirect callback", () => {
  it("always redirects to the base URL root", async () => {
    const url = await authOptions.callbacks.redirect({
      url: "http://localhost:3001/somewhere/deep",
      baseUrl: "http://localhost:3001",
    });

    expect(url).toBe("http://localhost:3001/");
  });
});
