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
    const apiKey = process.env.FINANCIAL_DATA_API_KEY;
    if (!apiKey) throw new Error("Missing FINANCIAL_DATA_API_KEY");

    // Replace with real API endpoint in production
    const response = await fetch(`https://api.example.com/financials/${ticker}?apikey=${apiKey}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const result: ToolOutputEnvelope<FinancialData> = {
      value: {
        companyName: data.name || companyName,
        ticker,
        marketCap: data.marketCap || 0,
        peRatio: data.peRatio || 0,
        revenueGrowth: data.revenueGrowth || 0,
      },
      source: 'FinancialDataAPI',
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
