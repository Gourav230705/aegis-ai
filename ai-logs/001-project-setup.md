# Step 001: Project Setup

## Prompt / Instruction
Initialize Next.js 15 with TypeScript, Tailwind CSS, ESLint, Prettier.
Configure baseline security headers in `src/middleware.ts` (XSS protection, CSP scaffolding, strict CORS).
Create `.env.example`; add `.env` to `.gitignore`.

## Actions Taken
- Ran `npx create-next-app@15` to bootstrap the Next.js 15 project (using app router, TypeScript, Tailwind, ESLint).
- Installed Prettier (`npm install --save-dev prettier eslint-config-prettier`).
- Created `src/middleware.ts` setting robust security headers (CSP, XSS, Frame Options, CORS).
- Added an eslint-disable comment in `middleware.ts` to suppress the unused variable warning for `_request`.
- Created `.env.example` with standard domain keys (OPENAI, TAVILY, SEC, FINANCIAL_DATA).
- Confirmed `.env*` is in `.gitignore` by default from Next.js.

## Trade-offs & Decisions
- None required for this step. Next.js template defaults perfectly matched requirements.

## Smoke Test
- Ran `npm run build`. 
- Met with an ESLint warning initially (unused variable). Fixed by adding `// eslint-disable-next-line`.
- Second build passed with 0 warnings/errors.
