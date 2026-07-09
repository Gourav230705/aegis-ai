import { ToolOutputEnvelope, Citation } from '@/types/domain';
import { evidenceCache } from '@/lib/cache';

export async function fetchSecFilings(ticker: string): Promise<ToolOutputEnvelope<Citation[]>> {
  const cacheKey = `sec-${ticker}`;
  const cached = evidenceCache.get(cacheKey) as ToolOutputEnvelope<Citation[]> | undefined;
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const apiKey = process.env.SEC_API_KEY;
    if (!apiKey) throw new Error("Missing SEC_API_KEY");

    // Replace with real SEC API endpoint
    const response = await fetch(`https://api.example.com/sec/${ticker}?apikey=${apiKey}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const citations: Citation[] = (data.filings || []).slice(0, 3).map((filing: any, index: number) => ({
      id: `sec-${index}-${Date.now()}`,
      sourceUrl: filing.link,
      sourceName: 'SEC EDGAR',
      snippet: filing.summary || 'Summary of recent SEC filing (10-K/10-Q).',
      timestamp: filing.filedAt || new Date().toISOString(),
    }));

    const result: ToolOutputEnvelope<Citation[]> = {
      value: citations,
      source: 'SECFilingsAPI',
      fetchedAt: new Date().toISOString(),
      isMock: false,
    };

    evidenceCache.set(cacheKey, result, 86400000); // 24h cache for SEC filings
    return result;
  } catch {
    const fallbackResult: ToolOutputEnvelope<Citation[]> = {
      value: [
        {
          id: 'sec-fallback-1',
          sourceUrl: 'https://www.sec.gov/edgar.shtml',
          sourceName: 'SEC EDGAR',
          snippet: `Recent 10-K filing indicates steady revenue growth and manageable debt levels.`,
          timestamp: new Date().toISOString(),
        }
      ],
      source: 'FallbackSECFilings',
      fetchedAt: new Date().toISOString(),
      isMock: true,
    };
    return fallbackResult;
  } finally {
    clearTimeout(timeout);
  }
}
