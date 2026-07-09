# Step 003: Base Input, Security & Logging

## Prompt / Instruction
- Set up structured logging (Pino or Winston) in `src/lib/logger.ts`, with a request/correlation ID attached to every log line.
- Implement an in-memory token-bucket rate limiter in `src/lib/rateLimit.ts`.
- Write Zod schemas in `src/lib/validation.ts` to sanitize incoming payloads (company name: alphanumeric + limited punctuation, max length) — this is also the first line of defense against prompt-injection-shaped input.

## Actions Taken
- Installed `pino` and `zod` as runtime dependencies, and `pino-pretty` as a devDependency.
- Created `src/lib/logger.ts` using Pino, configured to pretty-print in development and emit JSON in production. Added `getLogger(requestId)` utility for correlation tracking.
- Created `src/lib/rateLimit.ts` implementing a classical token-bucket algorithm using an in-memory Map. Defaults to 10 max requests refilling at 1 req/sec.
- Created `src/lib/validation.ts` using Zod to strict-validate `companyName` and `ticker` payloads (alphanumeric + basic punctuation, bounded lengths) to sanitize input and prevent basic prompt injection vectors.

## Trade-offs & Decisions
- Used an in-memory Map for the rate limiter instead of Redis to keep the current architecture simple and dependency-light, as per strict incremental execution. Can be upgraded to Redis later if multi-node scaling is required.
- Chose Pino over Winston for its superior performance and native Next.js compatibility.
- Restricted the Zod regex aggressively since company names and tickers shouldn't contain complex script tags.

## Smoke Test
- Ran `npm run build`.
- Build completed successfully, proving TypeScript type safety across the new library modules.
