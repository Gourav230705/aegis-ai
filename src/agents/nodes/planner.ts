import { AgentState } from "../graph";

export const plannerNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log("[Planner Node] Generating plan for:", state.company?.name);
  return {
    plan: [
      "Step 1: Collect financial, SEC, and news data",
      "Step 2: Generate Bull and Bear arguments independently",
      "Step 3: Judge synthesizes cases and makes recommendation",
      "Step 4: Verifier checks citations and computes scores"
    ],
    status: "PLANNING_COMPLETE",
  };
};
