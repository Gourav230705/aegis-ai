import { AgentState } from "../graph";
import { createLLM } from "../../lib/llm";
import { z } from "zod";
export const BULL_SYSTEM_PROMPT = `You are a Bull Market Analyst Agent.
Your ONLY purpose is to surface growth vectors, optimistic signals, and positive catalysts for the given company.
You must entirely ignore negative data, liabilities, or risks.
DO NOT hedge your analysis toward the middle. Be uncompromisingly bullish and focus solely on the upside potential.`;

export const bullAgentNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log("[Bull Agent] Analyzing upside potential...");
  
  const schema = z.object({ bullCase: z.array(z.string()).describe("List of bullish arguments") });
  const model = createLLM().withStructuredOutput(schema, { name: "bull_analysis" });
  const prompt = `${BULL_SYSTEM_PROMPT}\n\nCompany: ${state.company?.name}\nEvidence:\n${JSON.stringify(state.thesis?.evidenceUsed)}`;
  const response = await model.invoke(prompt);
  const currentThesis = state.thesis || { thesis: "", bullCase: [], bearCase: [], evidenceUsed: [] };
  
  return {
    thesis: {
      ...currentThesis,
      bullCase: [...currentThesis.bullCase, ...response.bullCase]
    },
    status: "BULL_ANALYSIS_COMPLETE"
  };
};
