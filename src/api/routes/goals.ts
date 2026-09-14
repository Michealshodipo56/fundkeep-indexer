import { Router } from "express";
import { getGoal, getGoalsByOwner, type GoalRow } from "../../db.js";

export const goalsRouter = Router();

export interface IndexerGoal {
  goalId: number;
  owner: string;
  token: string;
  targetAmount: string;
  currentAmount: string;
  deadline: number;
  status: "LOCKED" | "UNLOCKED" | "WITHDRAWN";
  createdAtLedger: number;
  updatedAtLedger: number;
}

export function serializeGoal(row: GoalRow): IndexerGoal {
  const status = row.withdrawn ? "WITHDRAWN" : row.unlocked ? "UNLOCKED" : "LOCKED";
  return {
    goalId: row.goal_id,
    owner: row.owner,
    token: row.token,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
    deadline: row.deadline,
    status,
    createdAtLedger: row.created_at_ledger,
    updatedAtLedger: row.updated_at_ledger,
  };
}

goalsRouter.get("/goals/:owner", (req, res) => {
  const goals = getGoalsByOwner(req.params.owner).map(serializeGoal);
  res.json({ goals });
});

goalsRouter.get("/goals/:owner/:goalId", (req, res) => {
  const goalId = Number(req.params.goalId);
  if (isNaN(goalId) || !Number.isInteger(goalId)) {
    return res.status(404).json({ error: "Goal not found" });
  }

  const row = getGoal(goalId);
  if (!row || row.owner !== req.params.owner) {
    return res.status(404).json({ error: "Goal not found" });
  }

  res.json(serializeGoal(row));
});
