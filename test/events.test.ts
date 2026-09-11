import { Keypair, StrKey, nativeToScVal } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { decodeEvent } from "../src/events.js";

const OWNER = Keypair.random().publicKey();
const CALLER = Keypair.random().publicKey();
const TOKEN = StrKey.encodeContract(new Uint8Array(32).fill(3));

function fakeEvent(name: string, goalId: number, data: Record<string, unknown>) {
  return {
    topic: [
      nativeToScVal(name, { type: "symbol" }),
      nativeToScVal(goalId, { type: "u32" }),
    ],
    value: nativeToScVal(data),
    ledger: 12345,
    txHash: "abc123",
  } as any;
}

describe("decodeEvent", () => {
  it("decodes goal_created", () => {
    const decoded = decodeEvent(
      fakeEvent("goal_created", 0, {
        owner: OWNER,
        token: TOKEN,
        target_amount: 100_000_000n,
        deadline: 1_800_000_000n,
      })
    );

    expect(decoded).toEqual({
      kind: "goal_created",
      goalId: 0,
      owner: OWNER,
      token: TOKEN,
      targetAmount: 100_000_000n,
      deadline: 1_800_000_000n,
      ledger: 12345,
      txHash: "abc123",
    });
  });

  it("decodes deposit", () => {
    const decoded = decodeEvent(
      fakeEvent("deposit", 1, {
        caller: CALLER,
        amount: 40_000_000n,
        current_amount: 40_000_000n,
        unlocked: false,
      })
    );

    expect(decoded).toEqual({
      kind: "deposit",
      goalId: 1,
      caller: CALLER,
      amount: 40_000_000n,
      currentAmount: 40_000_000n,
      unlocked: false,
      ledger: 12345,
      txHash: "abc123",
    });
  });

  it("decodes unlock", () => {
    const decoded = decodeEvent(fakeEvent("unlock", 2, { via: "deadline" }));

    expect(decoded).toEqual({
      kind: "unlock",
      goalId: 2,
      via: "deadline",
      ledger: 12345,
      txHash: "abc123",
    });
  });

  it("decodes withdraw", () => {
    const decoded = decodeEvent(
      fakeEvent("withdraw", 3, { owner: OWNER, amount: 100_000_000n })
    );

    expect(decoded).toEqual({
      kind: "withdraw",
      goalId: 3,
      owner: OWNER,
      amount: 100_000_000n,
      ledger: 12345,
      txHash: "abc123",
    });
  });

  it("returns null for an unrecognized event name", () => {
    expect(decodeEvent(fakeEvent("something_else", 0, {}))).toBeNull();
  });
});
