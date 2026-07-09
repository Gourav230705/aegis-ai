# Step 002: Domain Types & Provenance

## Prompt / Instruction
Create `src/types/domain.ts`. Define interfaces: `Company`, `Evidence`, `Citation`, `InvestmentThesis`, `RiskFactor`, and `ResearchManifest` (fields: `requestId`, `timestamp`, `sourcesUsed`, `apisCalled`, `cached`, `retries`, `failures`, `verifiedCitations`, `researchDurationMs`).
Define the universal tool output envelope type: `{ value: unknown, source: string, fetchedAt: string, isMock: boolean }`.

## Actions Taken
- Created `src/types/domain.ts` containing the core type declarations for the platform.
- Implemented `Company`, `Citation`, `Evidence`, `InvestmentThesis`, `RiskFactor`, and `ResearchManifest` interfaces.
- Implemented `ToolOutputEnvelope<T>` which tracks provenance data (source, timestamp, mock status) alongside the value payload.

## Trade-offs & Decisions
- Used generic type `ToolOutputEnvelope<T = unknown>` to allow strong typing for different tool responses while retaining a universal envelope footprint.
- Risk severity used an enum-style union type (`'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`) for type safety.

## Smoke Test
- Ran `npm run build` to ensure new types do not break existing compilation.
- Type definitions verified with no warnings.
