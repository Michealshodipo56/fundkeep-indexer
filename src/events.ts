import { scValToNative, type rpc } from "@stellar/stellar-sdk";

export type DecodedEvent =
  | {
      kind: "goal_created";
      goalId: number;
      owner: string;
      token: string;
      targetAmount: bigint;
      deadline: bigint;
      ledger: number;
      txHash: string;
    }
  | {
      kind: "deposit";
      goalId: number;
      caller: string;
      amount: bigint;
      currentAmount: bigint;
      unlocked: boolean;
      ledger: number;
      txHash: string;
    }
  | {
      kind: "unlock";
      goalId: number;
      via: string;
      ledger: number;
      txHash: string;
    }
  | {
      kind: "withdraw";
      goalId: number;
      owner: string;
      amount: bigint;
      ledger: number;
      txHash: string;
    };

/**
 * Decodes one raw event from `getEvents` into a typed domain event, per the
 * shapes published in fundkeep-contract's `src/events.rs`. Returns null for
 * events this indexer doesn't recognize (e.g. from another contract, or a
 * future event type this version predates).
 */
export function decodeEvent(event: rpc.Api.EventResponse): DecodedEvent | null {
  const topics = event.topic.map((t) => scValToNative(t));
  const [name, goalId] = topics as [string, number];
  const data = scValToNative(event.value) as Record<string, unknown>;

  switch (name) {
    case "goal_created":
      return {
        kind: "goal_created",
        goalId,
        owner: data.owner as string,
        token: data.token as string,
        targetAmount: data.target_amount as bigint,
        deadline: data.deadline as bigint,
        ledger: event.ledger,
        txHash: event.txHash,
      };
    case "deposit":
      return {
        kind: "deposit",
        goalId,
        caller: data.caller as string,
        amount: data.amount as bigint,
        currentAmount: data.current_amount as bigint,
        unlocked: data.unlocked as boolean,
        ledger: event.ledger,
        txHash: event.txHash,
      };
    case "unlock":
      return {
        kind: "unlock",
        goalId,
        via: data.via as string,
        ledger: event.ledger,
        txHash: event.txHash,
      };
    case "withdraw":
      return {
        kind: "withdraw",
        goalId,
        owner: data.owner as string,
        amount: data.amount as bigint,
        ledger: event.ledger,
        txHash: event.txHash,
      };
    default:
      return null;
  }
}
