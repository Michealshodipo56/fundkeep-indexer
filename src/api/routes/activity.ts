import { Router } from "express";
import { getActivityByOwner, type ActivityRow } from "../../db.js";

export const activityRouter = Router();

function serializeActivity(row: ActivityRow) {
  return {
    id: row.id,
    goalId: row.goal_id,
    owner: row.owner,
    type: row.type,
    amount: row.amount,
    ledger: row.ledger,
    txHash: row.tx_hash,
    createdAt: row.created_at,
  };
}

activityRouter.get("/activity/:owner", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const activity = getActivityByOwner(req.params.owner, limit).map(
    serializeActivity
  );
  res.json({ activity });
});
