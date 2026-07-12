export interface Company {
  name: string;
  ticker: string;
  sector?: string;
  industry?: string;
  description?: string;
  marketCap?: number;
}

export interface Citation {
  id: string;
  sourceUrl: string;
  sourceName: string;
  snippet: string;
  timestamp: string;
}

export interface Evidence {
  id: string;
  claim: string;
  isVerified: boolean;
  citations: Citation[];
}

export interface InvestmentThesis {
  thesis: string;
  bullCase: string[];
  bearCase: string[];
  evidenceUsed: Evidence[];
}

export interface RiskFactor {
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidenceIds: string[];
}

export interface ResearchManifest {
  requestId: string;
  timestamp: string;
  sourcesUsed: string[];
  apisCalled: number;
  cached: boolean;
  retries: number;
  failures: number;
  verifiedCitations: number;
  researchDurationMs: number;
  researchQuality?: number;
  decisionConfidence?: number;
  verificationWarnings?: string[];
}

export interface ToolOutputEnvelope<T = unknown> {
  value: T;
  source: string;
  fetchedAt: string;
  isMock: boolean;
}
