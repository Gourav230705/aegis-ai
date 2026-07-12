import { z } from "zod";
import { AgentState } from "../graph";

// Define the structured output schema for LangChain
export const judgeOutputSchema = z.object({
  recommendation: z.enum(["BUY", "PASS"]).describe("The final investment decision."),
  investmentTheses: z.array(z.string()).describe("A list of key investment theses synthesized from evidence."),
  sourceCitations: z.array(z.number()).describe("Array of indices mapping to tool outputs.")
});

export type JudgeDecision = z.infer<typeof judgeOutputSchema>;

export const JUDGE_SYSTEM_PROMPT = `You are the Judge Agent (Decision Engine).
Synthesize the optimistic (bull) and pessimistic (bear) arguments.
Output a final decision (BUY or PASS) and the synthesized investment theses.
You must map your arguments to the provided source citations.
DO NOT output a confidence score.`;

export const judgeAgentNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log("[Judge Agent] Synthesizing cases and making decision...");

  // TODO: Connect actual LangChain model with structured output binding
  /*
  const model = new ChatOpenAI({ temperature: 0 }).withStructuredOutput(judgeOutputSchema, { name: "decision" });
  const response = await model.invoke(JUDGE_SYSTEM_PROMPT + ...);
  */

  // Mocking the structured extraction based on the schema
  const mockDecision: JudgeDecision = {
    recommendation: "BUY",
    investmentTheses: [
      "Company shows strong fundamentals and growth potential.",
      "Bearish risks are adequately mitigated by the new product line."
    ],
    sourceCitations: [0, 1]
  };

  const currentThesis = state.thesis || { thesis: "", bullCase: [], bearCase: [], evidenceUsed: [] };

  // Combine recommendation and theses into the single thesis string for the domain model
  const finalThesisString = `[RECOMMENDATION: ${mockDecision.recommendation}] \n\n` + mockDecision.investmentTheses.join("\n");

  return {
    thesis: {
      ...currentThesis,
      thesis: finalThesisString
    },
    judgeCitations: mockDecision.sourceCitations,
    status: "JUDGE_COMPLETE"
  };
};
