# Step 012: Dashboard UI & Citations Canvas

**Prompt Sent:**
"Build `src/app/research/[company]/page.tsx` with a Framer Motion animated timeline reflecting real graph-state transitions. Mandatory rendering order, top to bottom: Evidence table -> Verification / Manifest receipt -> Agent reasoning (Bull vs. Bear) -> Final recommendation. Mandatory fallback disclosure: any data point where `isMock === true` must show a visible 'Using fallback/sample data' badge."

**What was kept:**
- Installed `framer-motion` and built the client-side component `src/app/research/[company]/page.tsx` to handle Server-Sent Events (SSE) updates from the LangGraph API.
- Implemented the exact top-to-bottom rendering order specified: Evidence, Verification Receipt, Reasoning, Decision.
- Used `framer-motion`'s `<motion.section>` to smoothly reveal sections as data becomes available in the streaming state (e.g. `hasEvidence`, `hasManifest`, `hasReasoning`).
- Created a `<MockBadge />` and strategically placed it near the evidence table and agent reasoning blocks since we are using mocked node logic right now.

**What was changed/rejected:**
- `any` types were used in the local `ClientAgentState` interface mapping because we couldn't reuse `domain.ts` types perfectly without potentially causing build-time serialization issues on client boundaries in Next.js, though we adhered to the shape.

**Trade-offs:**
- Used a simple local React State merging strategy for the SSE chunk parsing instead of a complex reducer, since LangGraph state changes overwrite top-level keys. This keeps the client bundle lightweight and performs excellently for this specific graph schema.
