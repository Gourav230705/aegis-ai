import { z } from "zod";
import { AgentState } from "../graph";
import { createLLM } from "../../lib/llm";

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

  const model = createLLM().withStructuredOutput(judgeOutputSchema, { name: "decision" });
  const prompt = `${JUDGE_SYSTEM_PROMPT}\n\nCompany: ${state.company?.name}\n\nBull Case:\n${state.thesis?.bullCase.join("\\n")}\n\nBear Case:\n${state.thesis?.bearCase.join("\\n")}\n\nEvidence:\n${JSON.stringify(state.thesis?.evidenceUsed)}`;
  const decision = await model.invoke(prompt);

  const currentThesis = state.thesis || { thesis: "", bullCase: [], bearCase: [], evidenceUsed: [] };

  // Combine recommendation and theses into the single thesis string for the domain model
  const finalThesisString = `[RECOMMENDATION: ${decision.recommendation}] \n\n` + decision.investmentTheses.join("\n");

  return {
    thesis: {
      ...currentThesis,
      thesis: finalThesisString
    },
    judgeCitations: decision.sourceCitations,
    status: "JUDGE_COMPLETE"
  };
};
