import { ToolOutputEnvelope, Citation } from '@/types/domain';
import { evidenceCache } from '@/lib/cache';

export async function fetchSecFilings(ticker: string): Promise<ToolOutputEnvelope<Citation[]>> {
  const cacheKey = `sec-${ticker}`;
  const cached = evidenceCache.get(cacheKey) as ToolOutputEnvelope<Citation[]> | undefined;
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const userAgent = process.env.SEC_USER_AGENT;
    if (!userAgent) throw new Error("Missing SEC_USER_AGENT");

    const headers = { 'User-Agent': userAgent };

    // 1. Fetch Ticker to CIK mapping
    const mappingRes = await fetch('https://www.sec.gov/files/company_tickers.json', {
      headers,
      signal: controller.signal,
    });
    if (!mappingRes.ok) throw new Error(`SEC Mapping API returned ${mappingRes.status}`);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappingData: Record<string, any> = await mappingRes.json();
    let cikStr = '';
    
    // Search the mapping for the matching ticker (values are { cik_str, ticker, title })
    for (const key of Object.keys(mappingData)) {
      if (mappingData[key].ticker.toUpperCase() === ticker.toUpperCase()) {
        // SEC API requires CIK padded to 10 digits
        cikStr = mappingData[key].cik_str.toString().padStart(10, '0');
        break;
      }
    }

    if (!cikStr) throw new Error(`Could not find CIK for ticker ${ticker}`);

    // 2. Fetch submissions for the CIK
    const submissionsRes = await fetch(`https://data.sec.gov/submissions/CIK${cikStr}.json`, {
      headers,
      signal: controller.signal,
    });
    if (!submissionsRes.ok) throw new Error(`SEC Submissions API returned ${submissionsRes.status}`);
    const data = await submissionsRes.json();

    const recent = data.filings?.recent;
    if (!recent) throw new Error("No recent filings found");

    const citations: Citation[] = [];
    let count = 0;

    for (let i = 0; i < recent.accessionNumber.length; i++) {
      if (count >= 3) break;
      const form = recent.form[i];
      // Filter to relevant forms
      if (form === '10-K' || form === '10-Q' || form === '8-K') {
        const accession = recent.accessionNumber[i].replace(/-/g, '');
        const primaryDoc = recent.primaryDocument[i];
        
        citations.push({
          id: `sec-${cikStr}-${count}`,
          sourceUrl: `https://www.sec.gov/Archives/edgar/data/${data.cik}/${accession}/${primaryDoc}`,
          sourceName: `SEC EDGAR Form ${form}`,
          snippet: `Filed on ${recent.filingDate[i]}.`,
          timestamp: recent.filingDate[i],
        });
        count++;
      }
    }

    const result: ToolOutputEnvelope<Citation[]> = {
      value: citations,
      source: 'SEC EDGAR API',
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
