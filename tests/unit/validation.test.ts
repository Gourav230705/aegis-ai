import { test } from "node:test";
import * as assert from "node:assert";
import { CompanyResearchInputSchema } from "../../src/lib/validation";

test("Zod Validation - Valid Input", () => {
  const result = CompanyResearchInputSchema.safeParse({ companyName: "Apple Inc.", ticker: "AAPL" });
  assert.strictEqual(result.success, true);
});

test("Zod Validation - Invalid characters (prompt injection defense)", () => {
  const result = CompanyResearchInputSchema.safeParse({ companyName: "Apple <script>alert(1)</script>" });
  assert.strictEqual(result.success, false);
});

test("Zod Validation - Too long", () => {
  const result = CompanyResearchInputSchema.safeParse({ companyName: "A".repeat(101) });
  assert.strictEqual(result.success, false);
});

test("Zod Validation - Ticker formatting", () => {
  const result = CompanyResearchInputSchema.safeParse({ companyName: "Apple Inc.", ticker: "aapl" });
  // aapl is lowercase, should fail according to regex /^[A-Z0-9.-]+$/
  assert.strictEqual(result.success, false);
});
