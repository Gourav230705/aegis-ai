# Architecture & Design Decisions

This document tracks all meaningful trade-offs, architecture decisions, and deviations encountered during the step-by-step build of Aegis AI.

## Step 001: Project Setup
- **Decision**: Relied entirely on Next.js 15 default `create-next-app` structure rather than a heavily customized monorepo or custom server.
- **Rationale**: Keeps the architecture simple and aligned with standard Next.js conventions.

## Step 002: Domain Types & Provenance
- **Decision**: Used an enum-style union string for risk severity (`'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`) instead of a TypeScript `enum`.
- **Rationale**: Safer for JSON serialization/deserialization across agent boundaries.
- **Decision**: Designed the `ToolOutputEnvelope<T>` generically.
- **Rationale**: Ensures a consistent provenance wrapper (tracking `isMock`, `fetchedAt`, and `source`) regardless of the specific data schema being fetched.

## Step 003: Base Input, Security & Logging
- **Decision**: Used an in-memory Map for the token-bucket rate limiter instead of an external store like Redis.
- **Rationale**: Keeps the initial structural foundation dependency-light and compliant with incremental execution requirements. Can be refactored to Redis if multi-node scaling is introduced later.
- **Decision**: Chose Pino over Winston for logging.
- **Rationale**: Superior performance and better out-of-the-box integration for Next.js JSON structured logging in production.

## Step 004: Landing Interface
- **Decision**: Re-used the exact Zod schema (`CompanyResearchInputSchema`) from `src/lib/validation.ts` on the client using `@hookform/resolvers`.
- **Rationale**: Ensures zero drift between client-side validation constraints and server-side API defense mechanisms.

## Step 005: Evidence Providers & Caching
- **Decision**: Built a custom lightweight in-memory `LRUCache` rather than installing an external package like `lru-cache`.
- **Rationale**: Satisfies the requirement for a "simple in-memory LRU cache" while avoiding unnecessary dependency bloat during early development.
