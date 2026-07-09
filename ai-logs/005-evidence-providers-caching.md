# Step 005: Evidence Providers & Caching

## Prompt / Instruction
- Create `src/lib/cache.ts`: simple in-memory LRU cache.
- Build `src/tools/financialData.ts`, `newsSearch.ts`, `secFilings.ts`. Every external call wrapped with an explicit 8-second timeout and a fallback path.
- **CRITICAL:** every tool return must use the provenance envelope from Step 002. If an API quota is exhausted or a call fails after retry, return fallback/sample data with `isMock: true` set explicitly — never silently.

## Actions Taken
- Implemented `src/lib/cache.ts` building a generic, strict in-memory LRU cache mapped to limits to avoid unbounded memory consumption. Instantiated `evidenceCache`.
- Created `src/tools/financialData.ts` to mock/fetch core company financial metrics.
- Created `src/tools/newsSearch.ts` utilizing a structure compatible with Tavily search for recent news.
- Created `src/tools/secFilings.ts` to mock/fetch recent EDGAR filings.
- All three providers:
  - Check the LRU cache first.
  - Implement a rigid 8-second timeout (`AbortController`).
  - Return the `ToolOutputEnvelope` structure imported from `src/types/domain.ts`.
  - Provide a deterministic fallback if the API fails, ensuring `isMock: true` is strictly flagged alongside the source of failure.

## Trade-offs & Decisions
- Built an internal lightweight LRU Cache instead of relying on external packages like `lru-cache` to satisfy "simple in-memory LRU cache" and avoid dependency bloat.

## Smoke Test
- Ran `npm run build`. 
- No type errors between the domain schema types and the tool implementations.
