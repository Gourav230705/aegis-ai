import { ToolOutputEnvelope } from '@/types/domain';
import { evidenceCache } from '@/lib/cache';

export interface FinancialData {
  companyName: string;
  ticker: string;
  marketCap: number;
  peRatio: number;
  revenueGrowth: number;
}

export async function fetchFinancialData(ticker: string, companyName: string): Promise<ToolOutputEnvelope<FinancialData>> {
  const cacheKey = `financial-${ticker}`;
  const cached = evidenceCache.get(cacheKey) as ToolOutputEnvelope<FinancialData> | undefined;
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error("Missing FINNHUB_API_KEY");

    // Fetch company profile (for market cap and name)
    const profileRes = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`, {
      signal: controller.signal,
    });
    if (!profileRes.ok) throw new Error(`Profile API returned ${profileRes.status}`);
    const profileData = await profileRes.json();

    // Fetch basic financials (for P/E and revenue growth)
    const metricsRes = await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${apiKey}`, {
      signal: controller.signal,
    });
    if (!metricsRes.ok) throw new Error(`Metrics API returned ${metricsRes.status}`);
    const metricsData = await metricsRes.json();

    // Finnhub marketCap is in millions, convert to actual
    const marketCap = profileData.marketCapitalization ? profileData.marketCapitalization * 1000000 : 0;
    // Basic financials metric object
    const metric = metricsData.metric || {};

    const result: ToolOutputEnvelope<FinancialData> = {
      value: {
        companyName: profileData.name || companyName,
        ticker,
        marketCap,
        peRatio: metric.peExclExtraTTM || metric.peNormalizedAnnual || 0,
        revenueGrowth: metric.revenueGrowthTTMYoy || metric.revenueGrowth5Y || 0,
      },
      source: 'Finnhub',
      fetchedAt: new Date().toISOString(),
      isMock: false,
    };

    evidenceCache.set(cacheKey, result, 300000); // 5 min cache
    return result;
  } catch {
    // Fallback on error or timeout
    const fallbackResult: ToolOutputEnvelope<FinancialData> = {
      value: {
        companyName,
        ticker,
        marketCap: 2500000000000,
        peRatio: 25.5,
        revenueGrowth: 0.12,
      },
      source: 'FallbackFinancialData',
      fetchedAt: new Date().toISOString(),
      isMock: true,
    };
    return fallbackResult;
  } finally {
    clearTimeout(timeout);
  }
}
