import { StateGraph, START, END } from "@langchain/langgraph";
import { Company, ResearchManifest, InvestmentThesis } from "../types/domain";

import { plannerNode } from "./nodes/planner";
import { dataCollectorNode } from "./nodes/dataCollector";
import { bullAgentNode } from "./nodes/bullAgent";
import { bearAgentNode } from "./nodes/bearAgent";
import { judgeAgentNode } from "./nodes/judgeAgent";
import { verifierNode } from "./nodes/verifier";

// Define the State shape using domain.ts types
export interface AgentState {
  company: Company | null;
  manifest: ResearchManifest | null;
  thesis: InvestmentThesis | null;
  plan: string[];
  status: string;
  verificationWarnings: string[];
  judgeCitations: number[];
}

// 1. Define state channels
const agentStateChannels = {
  company: {
    value: (x: Company | null, y?: Company | null) => y ?? x,
    default: () => null,
  },
  manifest: {
    value: (x: ResearchManifest | null, y?: ResearchManifest | null) => y ?? x,
    default: () => null,
  },
  thesis: {
    value: (x: InvestmentThesis | null, y?: InvestmentThesis | null) => {
      if (!x) return y ?? null;
      if (!y) return x;
      return {
        thesis: y.thesis || x.thesis,
        bullCase: y.bullCase && y.bullCase.length > 0 ? y.bullCase : x.bullCase,
        bearCase: y.bearCase && y.bearCase.length > 0 ? y.bearCase : x.bearCase,
        evidenceUsed: y.evidenceUsed && y.evidenceUsed.length > 0 ? y.evidenceUsed : x.evidenceUsed,
      };
    },
    default: () => null,
  },
  plan: {
    value: (x: string[], y?: string[]) => y ? x.concat(y) : x,
    default: () => [],
  },
  status: {
    value: (x: string, y?: string) => y ?? x,
    default: () => "INIT",
  },
  verificationWarnings: {
    value: (x: string[], y?: string[]) => y ? x.concat(y) : x,
    default: () => [],
  },
  judgeCitations: {
    value: (x: number[], y?: number[]) => y ?? x,
    default: () => [],
  }
};

// 2. Build Graph
const workflow = new StateGraph<AgentState>({
  channels: agentStateChannels
})
  .addNode("planner", plannerNode)
  .addNode("dataCollector", dataCollectorNode)
  .addNode("bullAgent", bullAgentNode)
  .addNode("bearAgent", bearAgentNode)
  .addNode("judgeAgent", judgeAgentNode)
  .addNode("verifier", verifierNode)
  
  // Wire the complete path
  .addEdge(START, "planner")
  .addEdge("planner", "dataCollector")
  // Parallel nodes
  .addEdge("dataCollector", "bullAgent")
  .addEdge("dataCollector", "bearAgent")
  // Both flow into judge
  .addEdge("bullAgent", "judgeAgent")
  .addEdge("bearAgent", "judgeAgent")
  .addEdge("judgeAgent", "verifier")
  .addEdge("verifier", END);

// 3. Compile the graph
export const aegisResearchGraph = workflow.compile();
