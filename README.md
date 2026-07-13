# Aegis AI 🛡️

## Overview — What It Does
Aegis AI is an advanced, AI-powered financial investment analysis tool. It uses a multi-agent orchestration architecture to synthesize both optimistic (Bull) and pessimistic (Bear) cases for a given company, analyze evidence, and ultimately provide an investment recommendation (BUY or PASS) along with detailed investment theses and source citations.

## How to Run It — Setup and Run Steps
To get started with Aegis AI locally, follow these steps:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory based on `.env.example` and add your API keys:
   - `GROQ_API_KEY`: Required to power the LangGraph analysis using Groq's LLM API (llama-3.3-70b-versatile).
   - `FINNHUB_API_KEY`: Required to fetch real financial metrics (obtain from https://finnhub.io).
   - `SEC_USER_AGENT`: Required to query the SEC EDGAR API (format: 'CompanyName YourEmail').
   - `TAVILY_API_KEY`: Required for fetching recent news and market catalysts.

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the application.

## How It Works – Approach & Architecture

This project follows an **evidence-first, multi-agent architecture** built on top of LangGraph. Instead of allowing a single AI model to generate an investment recommendation directly, the system collects information from multiple trusted sources, validates that evidence, and then uses specialized AI agents to analyze it from different perspectives. 

### System Workflow

1. **Input Validation:** User enters a ticker. The input is strictly validated via Zod.
2. **Planner Agent:** Creates the research plan and structures the shared graph state.
3. **Data Collector:** Gathers real-time evidence:
   - **Finnhub:** Market cap, P/E ratio, revenue growth.
   - **Tavily:** Recent news articles and market sentiment.
   - **SEC EDGAR:** 10-K and 10-Q filings.
4. **Multi-Agent Analysis:**
   - **Bull Agent:** Focuses exclusively on positive investment signals and growth vectors.
   - **Bear Agent:** Focuses exclusively on investment risks and liabilities.
5. **Judge (Decision Engine):** Synthesizes both cases and the raw evidence. It outputs a deterministic BUY/PASS recommendation alongside key investment theses mapped to specific source citations.
6. **Verifier:** Checks all citations outputted by the Judge to ensure they actually exist in the collected evidence, penalizing hallucinations.

## Key Decisions & Trade-offs
- **Groq over OpenAI:** Chosen for its extremely low latency and fast inference, which is crucial when chaining multiple agent calls in LangGraph.
- **Structured Outputs via Zod:** Instead of parsing raw text, the agents enforce structured outputs natively. This guarantees the UI always receives a consistent `BUY` or `PASS` enum.
- **LangGraph over raw LangChain:** LangGraph provides robust state management for multi-step agent reasoning compared to simple linear chains.
- **Trade-off - Scope Limit:** The current system does not provide AI-generated confidence scores (explicitly disabled in prompts) to enforce a binary decision matrix, avoiding "fence-sitting" by the LLM.

## Example Runs

**Company:** Apple Inc. (AAPL)
- **Recommendation:** `BUY`
- **Agent Reasoning:** The Bull agent highlighted strong services revenue growth and robust cash reserves. The Bear agent noted supply chain risks and antitrust concerns. The Judge determined the solid financial baseline (Finnhub) and recent SEC filings outweighed the macro risks.
- **Verification:** 100/100 Research Quality, 80/100 Confidence (2 verified citations).

**Company:** Warner Bros. Discovery (WBD)
- **Recommendation:** `PASS`
- **Agent Reasoning:** The Bull agent highlighted manageable debt levels, but the Bear agent pointed out massive stagnancy in revenue and a complete lack of P/E ratios indicating a lack of investor confidence. The Judge weighted the weak fundamentals heavily and rejected the stock.
- **Verification:** 100/100 Research Quality, 80/100 Confidence (2 verified citations).

## What I Would Improve With More Time
- **Staggered Execution:** Implement delays or retry mechanisms for parallel agent execution (Bull/Bear) to prevent Groq API rate limits (HTTP 429) on free tiers.
- **Multi-Agent Debate:** Implement a back-and-forth debate loop between the Bull Agent and Bear Agent before the Judge makes a final decision.
- **Caching:** Cache SEC and Finnhub API responses locally (e.g., Redis or file-based) to reduce rate-limiting and speed up redundant queries.
- **UI Enhancements:** Add interactive charts mapping the stock's historical price performance alongside the generated thesis points.
