import { AgentState } from "../graph";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const dataCollectorNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log("[Data Collector Node] Gathering evidence...");
  
  // Here we would call the tools from src/tools/ (financialData, newsSearch, secFilings)
  // For the integration test, we will mock the evidence returned.
  
  const mockEvidence = [
    {
      id: "ev-1",
      claim: "Strong revenue growth expected.",
      isVerified: true,
      citations: [
        { id: "c-1", sourceUrl: "https://example.com/1", sourceName: "Financial Report", snippet: "Revenue grew 20%.", timestamp: new Date().toISOString() }
      ]
    },
    {
      id: "ev-2",
      claim: "Regulatory risks present in new market.",
      isVerified: true,
      citations: [
        { id: "c-2", sourceUrl: "https://example.com/2", sourceName: "SEC Filing", snippet: "Risk factor: regulation.", timestamp: new Date().toISOString() }
      ]
    }
  ];

  return {
    thesis: {
      thesis: "",
      bullCase: [],
      bearCase: [],
      evidenceUsed: mockEvidence
    },
    status: "DATA_COLLECTION_COMPLETE"
  };
};
