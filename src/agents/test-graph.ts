import { aegisResearchGraph } from './graph';

async function main() {
  console.log("Starting Graph Test...");
  const initialState = {
    company: { name: "Apple Inc", ticker: "AAPL" },
    manifest: null,
    thesis: null,
    plan: [],
    status: "START"
  };

  const result = await aegisResearchGraph.invoke(initialState);
  console.log("Final State:", JSON.stringify(result, null, 2));
}

main().catch(console.error);
