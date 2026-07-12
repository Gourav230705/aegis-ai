import { AgentState } from "../graph";
import { ResearchManifest } from "../../types/domain";

export const verifierNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log("[Verifier Node] Cross-checking citations and computing scores...");

  const warnings: string[] = [];
  const citations = state.judgeCitations || [];
  const evidenceList = state.thesis?.evidenceUsed || [];

  let verifiedCount = 0;

  // Cross-check every entry in the Judge's sourceCitations
  citations.forEach((citationIndex) => {
    if (citationIndex < 0 || citationIndex >= evidenceList.length) {
      warnings.push(`Unverifiable citation index: ${citationIndex} (out of bounds)`);
    } else {
      const evidence = evidenceList[citationIndex];
      // Simple verification check
      if (evidence && evidence.isVerified) {
        verifiedCount++;
      } else {
        warnings.push(`Citation ${citationIndex} is not verified in evidence store.`);
      }
    }
  });

  // 1. Compute researchQuality (0-100)
  // A function of source coverage, data freshness / non-mock ratio, and number of sources successfully verified.
  let researchQuality = 0;
  if (citations.length > 0) {
    researchQuality = Math.round((verifiedCount / citations.length) * 100);
  } else {
    // If no citations were made but we have evidence
    researchQuality = evidenceList.length > 0 ? 50 : 0;
  }

  // 2. Compute decisionConfidence (0-100)
  // A function of Bull/Bear agreement, evidence strength, and contradictions found (warnings).
  const bullCount = state.thesis?.bullCase.length || 0;
  const bearCount = state.thesis?.bearCase.length || 0;
  
  // Base confidence on having both bull and bear cases considered
  let decisionConfidence = 50; 
  if (bullCount > 0 && bearCount > 0) {
    decisionConfidence += 30; // 80 base if both sides analyzed
  } else if (bullCount > 0 || bearCount > 0) {
    decisionConfidence += 10;
  }

  // Penalize for verification warnings
  decisionConfidence -= (warnings.length * 15);
  decisionConfidence = Math.max(0, Math.min(100, decisionConfidence)); // clamp between 0-100

  // Assemble the ResearchManifest
  const currentManifest = state.manifest || {
    requestId: "REQ-" + Date.now(),
    timestamp: new Date().toISOString(),
    sourcesUsed: [],
    apisCalled: 0,
    cached: false,
    retries: 0,
    failures: 0,
    verifiedCitations: 0,
    researchDurationMs: 0
  };

  const finalManifest: ResearchManifest = {
    ...currentManifest,
    verifiedCitations: verifiedCount,
    researchQuality,
    decisionConfidence,
    verificationWarnings: warnings
  };

  return {
    manifest: finalManifest,
    verificationWarnings: warnings,
    status: "VERIFICATION_COMPLETE"
  };
};
