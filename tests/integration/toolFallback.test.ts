import { test } from "node:test";
import * as assert from "node:assert";
import { fetchSecFilings } from "../../src/tools/secFilings";

test("Tool Fallback - SEC Filings returns mock data on API failure", async () => {
  // We ensure SEC_API_KEY is not set so it fails immediately
  const originalKey = process.env.SEC_API_KEY;
  delete process.env.SEC_API_KEY;

  try {
    const result = await fetchSecFilings("TEST");
    assert.strictEqual(result.isMock, true);
    assert.strictEqual(result.source, "FallbackSECFilings");
    assert.ok(result.value.length > 0);
  } finally {
    if (originalKey) {
      process.env.SEC_API_KEY = originalKey;
    }
  }
});
