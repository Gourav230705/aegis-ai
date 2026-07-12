import { aegisResearchGraph } from "../src/agents/graph";
import { Company } from "../src/types/domain";

async function runIntegrationTest() {
  console.log("==========================================");
  console.log("   AEGIS-AI GRAPH INTEGRATION TEST");
  console.log("==========================================");

  const testCompany: Company = {
    name: "Apple Inc.",
    ticker: "AAPL",
    sector: "Technology",
    industry: "Consumer Electronics",
    marketCap: 3000000000000
  };

  const initialState = {
    company: testCompany,
    manifest: null,
    thesis: null,
    plan: [],
    status: "INIT",
    verificationWarnings: [],
    judgeCitations: []
  };

  console.log(`Starting graph execution for: ${testCompany.name} (${testCompany.ticker})...\n`);

  try {
    const finalState = await aegisResearchGraph.invoke(initialState);
    
    console.log("\n==========================================");
    console.log("   FINAL STATE SNAPSHOT");
    console.log("==========================================\n");
    
    console.log(JSON.stringify(finalState, null, 2));
    console.log("\nIntegration test completed successfully.");
  } catch (error) {
    console.error("Integration test failed with error:", error);
  }
}

runIntegrationTest();
