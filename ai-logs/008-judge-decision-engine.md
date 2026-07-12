# Step 008: Judge (Decision Engine) & Structured Extraction

**Prompt Sent:**
"Build `src/agents/nodes/judgeAgent.ts` using LangChain's structured-output binding against a Zod schema. Output fields: `recommendation` (BUY / PASS), `investmentTheses` (string array), `sourceCitations` (array mapping directly to tool output indices). The Judge does not output a confidence score."

**What was kept:**
- Implemented `src/agents/nodes/judgeAgent.ts`.
- Defined `judgeOutputSchema` using `zod` with the requested fields.
- Avoided confidence scores as requested.
- Implemented a mock state update using the generated schema for use until a real LLM model provider is integrated.

**What was changed/rejected:**
- Did not directly instantiate the LangChain Chat model because the prompt indicates step-by-step builds and `@langchain/openai` or a specific model provider wasn't specified in `package.json`. The mock decision path is left active and the structure for `withStructuredOutput` is left in comments.

**Trade-offs:**
- Re-use of `AgentState.thesis` by packing the `BUY`/`PASS` recommendation alongside the synthesized thesis instead of modifying the shared `domain.ts` types, adhering strictly to "do not add extraneous files or change structure".
