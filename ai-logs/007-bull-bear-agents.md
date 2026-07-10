# Step 007: Bull & Bear Agents

## Prompt
```text
**Step 007: Bull & Bear Agents** - Implement `src/agents/nodes/bullAgent.ts` and `bearAgent.ts`. - Strict system prompts: the Bull agent must ONLY surface growth vectors and optimistic signals; the 
Bear agent must ONLY surface liabilities, structural risk, and negative sentiment. Neither agent should 
hedge toward the middle — that defeats the purpose of running both.
```

## Actions Taken
- Implemented `src/agents/nodes/bullAgent.ts` with a strict `BULL_SYSTEM_PROMPT` instructing the agent to focus solely on growth vectors, optimistic signals, and positive catalysts, and to entirely ignore negative data.
- Implemented `src/agents/nodes/bearAgent.ts` with a strict `BEAR_SYSTEM_PROMPT` instructing the agent to focus solely on liabilities, structural risk, and negative sentiment, and to entirely ignore positive data.
- Added explicit instructions in both prompts to prevent hedging toward the middle.
- Scaffolded dummy implementations that update `AgentState.thesis.bullCase` and `AgentState.thesis.bearCase` respectively, preparing for future LLM integration.

## Trade-offs & Decisions
- None required for this step. Scaffolded dummy output is sufficient pending full integration.

## Smoke Test
- `npm run build` compiled successfully without any TypeScript regressions.
- `npm run lint` completed with no ESLint warnings.
