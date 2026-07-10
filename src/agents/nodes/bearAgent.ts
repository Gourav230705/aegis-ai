import { AgentState } from "../graph";

export const BEAR_SYSTEM_PROMPT = `You are a Bear Market Analyst Agent.
Your ONLY purpose is to surface liabilities, structural risk, negative sentiment, and bearish catalysts for the given company.
You must entirely ignore positive data, growth vectors, or optimistic signals.
DO NOT hedge your analysis toward the middle. Be uncompromisingly bearish and focus solely on the downside risk.`;

export const bearAgentNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log("[Bear Agent] Analyzing downside risks...");
  
  // TODO: Execute LLM call with BEAR_SYSTEM_PROMPT against gathered evidence/state data
  
  const mockBearCase = [
    "Macroeconomic headwinds threaten core business margins.",
    "High debt levels increase structural financial risk.",
    "Intense competition may lead to significant market share loss."
  ];

  const currentThesis = state.thesis || { thesis: "", bullCase: [], bearCase: [], evidenceUsed: [] };
  
  return {
    thesis: {
      ...currentThesis,
      bearCase: [...currentThesis.bearCase, ...mockBearCase]
    },
    status: "BEAR_ANALYSIS_COMPLETE"
  };
};
