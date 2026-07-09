# Step 004: Landing Interface

## Prompt / Instruction
- Build a minimalist search interface (Shadcn + Tailwind) on `src/app/page.tsx`.
- Client-side validation must mirror the server Zod schema exactly (same constraints, both places).

## Actions Taken
- Initialized Shadcn UI globally using `npx shadcn@latest init`.
- Added Shadcn UI components: `button`, `input`, `card`, `label`.
- Installed `react-hook-form` and `@hookform/resolvers` for Zod integration.
- Rewrote `src/app/page.tsx` as a Client Component rendering a clean, centered interface.
- Passed the existing `CompanyResearchInputSchema` from `src/lib/validation.ts` directly into `zodResolver`, ensuring exact parity between client and server validation.

## Trade-offs & Decisions
- Decided to pass query parameters during routing (`/research/[company]?ticker=[ticker]`) upon form submission, paving the way for the research API consumption in future steps.

## Smoke Test
- Ran `npm run build`.
- Build completed successfully, ensuring the client component integrates seamlessly into Next.js 15 without hydration or typing issues.
