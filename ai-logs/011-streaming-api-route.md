# Step 011: Streaming API Route

**Prompt Sent:**
"Configure `src/app/api/research/route.ts` to accept the validated POST payload, run the LangGraph sequence, and stream state updates to the client via Server-Sent Events."

**What was kept:**
- Created `src/app/api/research/route.ts` which successfully parses incoming POST payloads using Zod (`CompanyResearchInputSchema`).
- Initialized the `AgentState` using the validated inputs.
- Wrapped the LangGraph execution with a `ReadableStream` to dispatch updates chunk-by-chunk to the client using Server-Sent Events (SSE).
- Integrated logging and rate-limiting to adhere to earlier structural rules.

**What was changed/rejected:**
- Used Node.js `ReadableStream` within a standard `NextResponse` instead of a 3rd party SSE wrapper package, as it's cleaner and native to Next.js App Router API routes.

**Trade-offs:**
- IP-based rate limiting relies on standard HTTP headers (`x-forwarded-for`), which may require proxy configuration depending on the deployment environment (e.g., Vercel automatically sets this, but local or custom proxy setups might not pass it reliably). We defaulted to `"unknown-ip"` if unavailable so it fails gracefully.
