import { AgentState } from "../graph";
import { createLLM } from "../../lib/llm";
import { z } from "zod";
export const BEAR_SYSTEM_PROMPT = `You are a Bear Market Analyst Agent.
Your ONLY purpose is to surface liabilities, structural risk, negative sentiment, and bearish catalysts for the given company.
You must entirely ignore positive data, growth vectors, or optimistic signals.
DO NOT hedge your analysis toward the middle. Be uncompromisingly bearish and focus solely on the downside risk.`;

export const bearAgentNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log("[Bear Agent] Analyzing downside risks...");
  
  const schema = z.object({ bearCase: z.array(z.string()).describe("List of bearish arguments") });
  const model = createLLM().withStructuredOutput(schema, { name: "bear_analysis" });
  const prompt = `${BEAR_SYSTEM_PROMPT}\n\nCompany: ${state.company?.name}\nEvidence:\n${JSON.stringify(state.thesis?.evidenceUsed)}`;
  const response = await model.invoke(prompt);
  const currentThesis = state.thesis || { thesis: "", bullCase: [], bearCase: [], evidenceUsed: [] };
  
  return {
    thesis: {
      ...currentThesis,
      bearCase: [...currentThesis.bearCase, ...response.bearCase]
    },
    status: "BEAR_ANALYSIS_COMPLETE"
  };
};
