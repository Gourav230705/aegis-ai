import { ChatGroq } from "@langchain/groq";

/**
 * Shared LLM Factory
 * Returns a configured ChatGroq instance for use across all agents.
 * 
 * Target Model: llama-3.3-70b-versatile
 * Fallback Model: deepseek-r1-distill-llama-70b
 */
export const createLLM = () => {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    maxRetries: 2,
  });
};
