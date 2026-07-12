import { test } from "node:test";
import * as assert from "node:assert";
import { verifierNode } from "../../src/agents/nodes/verifier";
import { AgentState } from "../../src/agents/graph";

test("Verifier Node - Dual Scoring Engine Math", async () => {
  const mockState: AgentState = {
    company: { name: "Test Inc.", ticker: "TST" },
    manifest: null,
    plan: [],
    status: "JUDGE_COMPLETE",
    verificationWarnings: [],
    judgeCitations: [0, 1],
    thesis: {
      thesis: "[RECOMMENDATION: BUY] Good company",
      bullCase: ["Good earnings"],
      bearCase: [],
      evidenceUsed: [
        { id: "e1", claim: "C1", isVerified: true, citations: [] },
        { id: "e2", claim: "C2", isVerified: false, citations: [] },
      ]
    }
  };

  const newState = await verifierNode(mockState);
  
  // 2 citations, 1 verified = 50% research quality
  assert.strictEqual(newState.manifest?.researchQuality, 50);
  
  // 1 warning because 1 is unverified
  assert.strictEqual(newState.verificationWarnings?.length, 1);

  // Confidence calculation: bullCase > 0, bearCase == 0 -> +10 to base 50 = 60
  // Warnings = 1 -> -15
  // Expected confidence: 60 - 15 = 45
  assert.strictEqual(newState.manifest?.decisionConfidence, 45);
});
