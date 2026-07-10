import { AgentState } from "../graph";

export const BULL_SYSTEM_PROMPT = `You are a Bull Market Analyst Agent.
Your ONLY purpose is to surface growth vectors, optimistic signals, and positive catalysts for the given company.
You must entirely ignore negative data, liabilities, or risks.
DO NOT hedge your analysis toward the middle. Be uncompromisingly bullish and focus solely on the upside potential.`;

export const bullAgentNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log("[Bull Agent] Analyzing upside potential...");
  
  // TODO: Execute LLM call with BULL_SYSTEM_PROMPT against gathered evidence/state data
  
  const mockBullCase = [
    "Strong revenue growth expected in the next quarter.",
    "Expanding into new high-margin markets.",
    "Innovative product pipeline poised to capture market share."
  ];

  const currentThesis = state.thesis || { thesis: "", bullCase: [], bearCase: [], evidenceUsed: [] };
  
  return {
    thesis: {
      ...currentThesis,
      bullCase: [...currentThesis.bullCase, ...mockBullCase]
    },
    status: "BULL_ANALYSIS_COMPLETE"
  };
};
