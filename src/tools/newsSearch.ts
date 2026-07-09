import { ToolOutputEnvelope, Citation } from '@/types/domain';
import { evidenceCache } from '@/lib/cache';

export async function fetchRecentNews(companyName: string, ticker: string): Promise<ToolOutputEnvelope<Citation[]>> {
  const cacheKey = `news-${companyName}-${ticker}`;
  const cached = evidenceCache.get(cacheKey) as ToolOutputEnvelope<Citation[]> | undefined;
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) throw new Error("Missing TAVILY_API_KEY");

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${companyName} (${ticker}) recent financial news`,
        search_depth: 'basic',
        include_images: false,
        max_results: 3,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const citations: Citation[] = (data.results || []).map((res: any, index: number) => ({
      id: `news-${index}-${Date.now()}`,
      sourceUrl: res.url,
      sourceName: new URL(res.url).hostname || 'News Source',
      snippet: res.content,
      timestamp: new Date().toISOString(),
    }));

    const result: ToolOutputEnvelope<Citation[]> = {
      value: citations,
      source: 'TavilyNewsSearch',
      fetchedAt: new Date().toISOString(),
      isMock: false,
    };

    evidenceCache.set(cacheKey, result, 300000);
    return result;
  } catch {
    const fallbackResult: ToolOutputEnvelope<Citation[]> = {
      value: [
        {
          id: `news-fallback-1`,
          sourceUrl: 'https://example.com/news/1',
          sourceName: 'Example Financial News',
          snippet: `${companyName} announces positive quarterly earnings amid market volatility.`,
          timestamp: new Date().toISOString(),
        }
      ],
      source: 'FallbackNewsSearch',
      fetchedAt: new Date().toISOString(),
      isMock: true,
    };
    return fallbackResult;
  } finally {
    clearTimeout(timeout);
  }
}
