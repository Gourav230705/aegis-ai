import { AgentState } from "../graph";
import { fetchFinancialData } from "../../tools/financialData";
import { fetchSecFilings } from "../../tools/secFilings";

export const dataCollectorNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log("[Data Collector Node] Gathering evidence...");
  
  if (!state.company) throw new Error("No company in state");

  // Call the newly implemented production APIs
  const financialOut = await fetchFinancialData(state.company.ticker, state.company.name);
  const secOut = await fetchSecFilings(state.company.ticker);

  const evidence = [];

  // Map Financial Data to an Evidence claim
  evidence.push({
    id: "ev-fin",
    claim: `Financials: Market Cap $${financialOut.value.marketCap}, P/E ${financialOut.value.peRatio}, Revenue Growth ${financialOut.value.revenueGrowth}`,
    isVerified: true,
    citations: [{
      id: `c-fin-${Date.now()}`,
      sourceUrl: "https://finnhub.io",
      sourceName: financialOut.source,
      snippet: "Company financial metrics",
      timestamp: financialOut.fetchedAt
    }]
  });

  // Map SEC Filings to an Evidence claim
  if (secOut.value.length > 0) {
    evidence.push({
      id: "ev-sec",
      claim: "Recent SEC EDGAR Filings retrieved successfully.",
      isVerified: true,
      citations: secOut.value
    });
  }

  return {
    thesis: {
      thesis: "",
      bullCase: [],
      bearCase: [],
      evidenceUsed: evidence
    },
    status: "DATA_COLLECTION_COMPLETE"
  };
};
