import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import { createServer } from "../src/api/server.js";
import { db, insertGoal, setSyncState } from "../src/db.js";

const OWNER = "GOWNER00000000000000000000000000000000000000000000000";
const TOKEN = "CTOKEN000000000000000000000000000000000000000000000000";

describe("Goals API", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createServer();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (typeof address === "object" && address !== null) {
          baseUrl = `http://127.0.0.1:${address.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  beforeEach(() => {
    db.exec("DELETE FROM goals; DELETE FROM activity;");
    setSyncState(null, 0);
  });

  describe("GET /api/goals/:owner/:goalId", () => {
    it("returns a single IndexerGoal object when found", async () => {
      insertGoal({
        goalId: 42,
        owner: OWNER,
        token: TOKEN,
        targetAmount: 500_000_000n,
        deadline: 1_800_000_000n,
        ledger: 100,
      });

      const res = await fetch(`${baseUrl}/api/goals/${OWNER}/42`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        goalId: 42,
        owner: OWNER,
        token: TOKEN,
        targetAmount: "500000000",
        currentAmount: "0",
        deadline: 1_800_000_000,
        status: "LOCKED",
        createdAtLedger: 100,
        updatedAtLedger: 100,
      });
    });

    it("returns 404 with { error: 'Goal not found' } if goalId is unknown", async () => {
      const res = await fetch(`${baseUrl}/api/goals/${OWNER}/999`);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({ error: "Goal not found" });
    });

    it("returns 404 with { error: 'Goal not found' } if goal exists but belongs to a different owner", async () => {
      insertGoal({
        goalId: 42,
        owner: OWNER,
        token: TOKEN,
        targetAmount: 500_000_000n,
        deadline: 1_800_000_000n,
        ledger: 100,
      });

      const otherOwner = "GOTHER0000000000000000000000000000000000000000000000";
      const res = await fetch(`${baseUrl}/api/goals/${otherOwner}/42`);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({ error: "Goal not found" });
    });

    it("returns 404 with { error: 'Goal not found' } for non-integer goalId", async () => {
      const res = await fetch(`${baseUrl}/api/goals/${OWNER}/notanumber`);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({ error: "Goal not found" });
    });
  });
});
