import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSessionMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: getServerSessionMock }));
vi.mock("../app/lib/auth", () => ({ authOptions: {} }));

import { GET, OPTIONS } from "../app/api/user/route";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/user", () => {
  it("returns the session user when logged in", async () => {
    const user = { id: "uuid-1", dbId: 1, number: "9876543210" };
    getServerSessionMock.mockResolvedValue({ user });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ user });
  });

  it("responds 403 when there is no session", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({ message: "You are not logged in" });
  });

  it("sets CORS headers on both outcomes", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const res = await GET();

    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });
});

describe("OPTIONS /api/user", () => {
  it("responds 204 with CORS headers for preflight", async () => {
    const res = await OPTIONS();

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
  });
});
