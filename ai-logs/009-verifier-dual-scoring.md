# Step 009: Verifier Node & Dual-Scoring Engine

**Prompt Sent:**
"Build `src/agents/nodes/verifier.ts`. Cross-check every entry in the Judge's `sourceCitations` against the actual evidence stored in graph state. Compute `researchQuality` and `decisionConfidence`. Assemble the `ResearchManifest` with real values and attach it to final graph state."

**What was kept:**
- `src/agents/nodes/verifier.ts` implements the cross-check using `state.judgeCitations` and the `state.thesis.evidenceUsed`.
- Computed `researchQuality` based on verified citations and total citations.
- Computed `decisionConfidence` based on the presence of bull and bear cases, heavily penalizing for `verificationWarnings`.
- Populated `ResearchManifest` with the new values.
- Updated `domain.ts` and `graph.ts` state to include `judgeCitations` and `verificationWarnings`, as well as `researchQuality` and `decisionConfidence` in `ResearchManifest`.

**What was changed/rejected:**
- Nothing rejected. 

**Trade-offs:**
- Had to append optional fields (`researchQuality`, `decisionConfidence`, `verificationWarnings`) to `ResearchManifest` in `domain.ts` to attach them to the graph state and return them to the client as instructed, keeping all types centralized in `domain.ts` without creating a whole new type.
