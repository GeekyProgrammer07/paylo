import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    onRampTransaction: { findMany: vi.fn() },
    p2pTransfer: { findMany: vi.fn() },
  },
}));

vi.mock("@paylo/db/client", () => ({ default: prismaMock }));

import { GET, OPTIONS } from "../app/api/balance/history/route";

function historyRequest(userId: string | number): Request {
  return new Request(`http://localhost/api/balance/history?userId=${userId}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.onRampTransaction.findMany.mockResolvedValue([]);
  // First call fetches transfers sent, second call transfers received.
  prismaMock.p2pTransfer.findMany.mockResolvedValue([]);
});

describe("GET /api/balance/history", () => {
  it("returns an empty history for a user with no activity", async () => {
    const res = await GET(historyRequest(1));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("only counts successful onramps for the requested user", async () => {
    await GET(historyRequest(7));

    expect(prismaMock.onRampTransaction.findMany).toHaveBeenCalledWith({
      where: { userId: 7, status: "Success" },
      select: { amount: true, startTime: true },
    });
  });

  it("queries transfers sent and received separately", async () => {
    await GET(historyRequest(7));

    expect(prismaMock.p2pTransfer.findMany).toHaveBeenNthCalledWith(1, {
      where: { fromUserId: 7 },
      select: { amount: true, timestamp: true },
    });
    expect(prismaMock.p2pTransfer.findMany).toHaveBeenNthCalledWith(2, {
      where: { toUserId: 7 },
      select: { amount: true, timestamp: true },
    });
  });

  it("builds a chronologically sorted running balance in rupees", async () => {
    prismaMock.onRampTransaction.findMany.mockResolvedValue([
      // 500 rupees credited first
      { amount: 50000, startTime: new Date("2026-01-01T10:00:00Z") },
    ]);
    prismaMock.p2pTransfer.findMany
      // sent: 200 rupees debited last
      .mockResolvedValueOnce([
        { amount: 20000, timestamp: new Date("2026-01-03T10:00:00Z") },
      ])
      // received: 100 rupees credited in between
      .mockResolvedValueOnce([
        { amount: 10000, timestamp: new Date("2026-01-02T10:00:00Z") },
      ]);

    const res = await GET(historyRequest(1));
    const body = await res.json();

    expect(body).toEqual([
      { time: "2026-01-01T10:00:00.000Z", balance: 500 },
      { time: "2026-01-02T10:00:00.000Z", balance: 600 },
      { time: "2026-01-03T10:00:00.000Z", balance: 400 },
    ]);
  });

  it("interleaves events out of insertion order by timestamp", async () => {
    prismaMock.onRampTransaction.findMany.mockResolvedValue([
      { amount: 10000, startTime: new Date("2026-02-02T00:00:00Z") },
      { amount: 30000, startTime: new Date("2026-02-01T00:00:00Z") },
    ]);

    const res = await GET(historyRequest(1));
    const body = await res.json();

    expect(body.map((p: { balance: number }) => p.balance)).toEqual([300, 400]);
  });

  it("can go negative if debits exceed credits", async () => {
    prismaMock.p2pTransfer.findMany
      .mockResolvedValueOnce([
        { amount: 5000, timestamp: new Date("2026-01-01T00:00:00Z") },
      ])
      .mockResolvedValueOnce([]);

    const res = await GET(historyRequest(1));
    const body = await res.json();

    expect(body).toEqual([{ time: "2026-01-01T00:00:00.000Z", balance: -50 }]);
  });
});

describe("OPTIONS /api/balance/history", () => {
  it("responds 204 with CORS headers for preflight", async () => {
    const res = await OPTIONS();

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
  });
});
