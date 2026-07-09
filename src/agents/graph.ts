import { StateGraph, START, END } from "@langchain/langgraph";
import { Company, ResearchManifest, InvestmentThesis } from "../types/domain";

// Define the State shape using domain.ts types
export interface AgentState {
  company: Company | null;
  manifest: ResearchManifest | null;
  thesis: InvestmentThesis | null;
  plan: string[];
  status: string;
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
    value: (x: InvestmentThesis | null, y?: InvestmentThesis | null) => y ?? x,
    default: () => null,
  },
  plan: {
    value: (x: string[], y?: string[]) => y ? x.concat(y) : x,
    default: () => [],
  },
  status: {
    value: (x: string, y?: string) => y ?? x,
    default: () => "INIT",
  }
};

// 2. Define the nodes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plannerNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log("[Planner Node] Generating plan...");
  return {
    plan: ["Step 1: Collect Data", "Step 2: Analyze Data"],
    status: "PLANNING_COMPLETE",
  };
};

// NOTE: this dummy node is scaffolding and will be removed in Step 010.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dummyExecutionNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log("[Dummy Node] Executing temporary logic...");
  return {
    status: "EXECUTION_COMPLETE",
  };
};

// 3. Build Graph
const workflow = new StateGraph<AgentState>({
  channels: agentStateChannels
})
  .addNode("planner", plannerNode)
  .addNode("dummyExecution", dummyExecutionNode)
  .addEdge(START, "planner")
  .addEdge("planner", "dummyExecution")
  .addEdge("dummyExecution", END);

// 4. Compile the graph
export const aegisResearchGraph = workflow.compile();
