import { Keypair, StrKey, nativeToScVal, rpc } from "@stellar/stellar-sdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db, getActivityByOwner, getGoal, getSyncState, setSyncState } from "../src/db.js";
import { pollOnce } from "../src/poller.js";

const OWNER = Keypair.random().publicKey();
const TOKEN = StrKey.encodeContract(new Uint8Array(32).fill(4));

function fakeEvent(name: string, goalId: number, data: Record<string, unknown>) {
  return {
    topic: [
      nativeToScVal(name, { type: "symbol" }),
      nativeToScVal(goalId, { type: "u32" }),
    ],
    value: nativeToScVal(data),
    ledger: 100,
    txHash: `tx-${name}-${goalId}`,
  };
}

beforeEach(() => {
  db.exec("DELETE FROM goals; DELETE FROM activity;");
  setSyncState(null, 0);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("pollOnce", () => {
  it("applies a goal_created event and advances the cursor", async () => {
    vi.spyOn(rpc.Server.prototype, "getEvents").mockResolvedValue({
      events: [
        fakeEvent("goal_created", 0, {
          owner: OWNER,
          token: TOKEN,
          target_amount: 100_000_000n,
          deadline: 1_800_000_000n,
        }),
      ],
      cursor: "cursor-1",
      latestLedger: 100,
      oldestLedger: 1,
      latestLedgerCloseTime: "",
      oldestLedgerCloseTime: "",
    } as any);
    vi.spyOn(rpc.Server.prototype, "getLatestLedger").mockResolvedValue({
      sequence: 200,
    } as any);

    await pollOnce();

    const goal = getGoal(0);
    expect(goal?.owner).toBe(OWNER);
    expect(goal?.target_amount).toBe("100000000");

    const activity = getActivityByOwner(OWNER);
    expect(activity).toHaveLength(1);
    expect(activity[0].type).toBe("create");

    expect(getSyncState()).toEqual({ cursor: "cursor-1", lastLedger: 100 });
  });

  it("records an unlock activity entry when a deposit crosses the target", async () => {
    vi.spyOn(rpc.Server.prototype, "getLatestLedger").mockResolvedValue({
      sequence: 200,
    } as any);
    const getEvents = vi.spyOn(rpc.Server.prototype, "getEvents");

    getEvents.mockResolvedValueOnce({
      events: [
        fakeEvent("goal_created", 1, {
          owner: OWNER,
          token: TOKEN,
          target_amount: 50_000_000n,
          deadline: 1_800_000_000n,
        }),
      ],
      cursor: "cursor-1",
      latestLedger: 100,
      oldestLedger: 1,
      latestLedgerCloseTime: "",
      oldestLedgerCloseTime: "",
    } as any);
    await pollOnce();

    getEvents.mockResolvedValueOnce({
      events: [
        fakeEvent("deposit", 1, {
          caller: OWNER,
          amount: 50_000_000n,
          current_amount: 50_000_000n,
          unlocked: true,
        }),
      ],
      cursor: "cursor-2",
      latestLedger: 101,
      oldestLedger: 1,
      latestLedgerCloseTime: "",
      oldestLedgerCloseTime: "",
    } as any);
    await pollOnce();

    const goal = getGoal(1);
    expect(goal?.unlocked).toBe(1);

    const types = getActivityByOwner(OWNER).map((a) => a.type).sort();
    expect(types).toEqual(["create", "deposit", "unlock"]);
  });
});
