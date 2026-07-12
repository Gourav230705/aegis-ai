"use client";

import React, { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { ResearchManifest, InvestmentThesis, Evidence, Citation } from "../../../types/domain";

// To avoid circular or missing dependencies in client components, we'll define a local interface
// that matches AgentState from graph.ts.
interface ClientAgentState {
  company: { name: string; ticker: string } | null;
  manifest: ResearchManifest | null;
  thesis: InvestmentThesis | null;
  plan: string[];
  status: string;
  verificationWarnings: string[];
  judgeCitations: number[];
}

const MockBadge = () => (
  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
    Using fallback/sample data
  </span>
);

export default function ResearchDashboard({ params }: { params: Promise<{ company: string }> }) {
  const resolvedParams = use(params);
  const [state, setState] = useState<ClientAgentState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const response = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyName: decodeURIComponent(resolvedParams.company) })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to start research");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No readable stream");

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setIsDone(true);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("data: ")) {
              const dataStr = part.replace("data: ", "");
              if (dataStr === "[DONE]") {
                setIsDone(true);
                break;
              }
              try {
                const chunk = JSON.parse(dataStr);
                // LangGraph stream outputs objects keyed by node name, e.g. { planner: { plan: [...] } }
                // or just the full state. The default `.stream()` yields state updates.
                // We'll merge the chunk into our state.
                const nodeName = Object.keys(chunk)[0];
                const stateUpdate = chunk[nodeName];
                
                setState((prev) => ({
                  ...(prev || {} as ClientAgentState),
                  ...stateUpdate
                }));
              } catch (e) {
                console.error("Failed to parse chunk", e);
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
        setIsDone(true);
      }
    };

    fetchStream();
  }, [resolvedParams.company]);

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!state) {
    return <div className="p-8 flex items-center gap-4 text-gray-500">
      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      Initializing Agent Engine...
    </div>;
  }

  // Mandatory rendering order:
  // 1. Evidence Table
  // 2. Verification / Manifest Receipt
  // 3. Agent Reasoning (Bull vs Bear)
  // 4. Final Recommendation

  const hasData = state.status !== "INIT" && state.status !== "PLANNING_COMPLETE";
  const evidence = state.thesis?.evidenceUsed || [];
  const hasEvidence = evidence.length > 0;
  
  const manifest = state.manifest;
  const hasManifest = manifest !== null;

  const hasReasoning = (state.thesis?.bullCase?.length || 0) > 0 || (state.thesis?.bearCase?.length || 0) > 0;
  
  // Parse recommendation from thesis string
  let recommendation = null;
  if (state.thesis?.thesis && state.thesis.thesis.includes("[RECOMMENDATION: ")) {
    const match = state.thesis.thesis.match(/\[RECOMMENDATION:\s*(BUY|PASS)\]/);
    if (match) recommendation = match[1];
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="border-b pb-4 mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Research Report</h1>
            <p className="text-gray-500 text-lg mt-1">{decodeURIComponent(resolvedParams.company)}</p>
          </div>
          <div className="text-sm font-mono text-gray-400">
            STATUS: {state.status} {isDone ? "(FINISHED)" : "(RUNNING...)"}
          </div>
        </header>

        {/* 1. Evidence Table */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={hasData ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">1. Evidence Gathered</h2>
          {hasEvidence ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-lg">Claim</th>
                    <th className="px-4 py-3 font-medium">Verified</th>
                    <th className="px-4 py-3 font-medium rounded-tr-lg">Sources</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {evidence.map((ev: Evidence, i: number) => (
                    <tr key={ev.id || i} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 align-top">
                        {ev.claim}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {ev.isVerified ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-red-500 font-medium">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-500">
                        {ev.citations?.map((c: Citation) => (
                          <div key={c.id} className="mb-1 text-xs">
                            <a href={c.sourceUrl} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                              {c.sourceName}
                            </a>
                            <span className="mx-1">&middot;</span>
                            <span className="italic">&quot;{c.snippet}&quot;</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-400 py-4 flex items-center gap-2 text-sm">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
              Awaiting data collection...
            </div>
          )}
        </motion.section>

        {/* 2. Verification / Manifest Receipt */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={hasManifest ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">2. Verification Receipt</h2>
          {manifest ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Research Quality</div>
                <div className="text-2xl font-bold">{manifest.researchQuality}<span className="text-sm text-gray-400 font-normal">/100</span></div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Decision Confidence</div>
                <div className="text-2xl font-bold">{manifest.decisionConfidence}<span className="text-sm text-gray-400 font-normal">/100</span></div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Verified Citations</div>
                <div className="text-2xl font-bold text-blue-600">{manifest.verifiedCitations}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Warnings</div>
                <div className="text-2xl font-bold text-amber-500">{manifest.verificationWarnings?.length || 0}</div>
              </div>
              
              {manifest.verificationWarnings && manifest.verificationWarnings.length > 0 && (
                <div className="col-span-full mt-2 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded text-sm">
                  <div className="font-semibold mb-1">Warnings log:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {manifest.verificationWarnings.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 py-4 text-sm flex items-center gap-2">
               <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
               Awaiting verification engine...
            </div>
          )}
        </motion.section>

        {/* 3. Agent Reasoning */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={hasReasoning ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center gap-2">
            3. Agent Reasoning
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bull Case */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center">
                <span className="text-xl mr-2">🐂</span> Bull Case
              </h3>
              <ul className="space-y-2">
                {(state.thesis?.bullCase?.length || 0) > 0 ? (
                  state.thesis!.bullCase.map((point: string, i: number) => (
                    <li key={i} className="flex text-emerald-900 text-sm">
                      <span className="mr-2 text-emerald-500">•</span>
                      <span>{point}</span>
                    </li>
                  ))
                ) : (
                   <li className="text-emerald-700/50 text-sm italic">Pending bull agent analysis...</li>
                )}
              </ul>
            </div>

            {/* Bear Case */}
            <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-rose-800 mb-3 flex items-center">
                <span className="text-xl mr-2">🐻</span> Bear Case
              </h3>
              <ul className="space-y-2">
                {(state.thesis?.bearCase?.length || 0) > 0 ? (
                  state.thesis!.bearCase.map((point: string, i: number) => (
                    <li key={i} className="flex text-rose-900 text-sm">
                      <span className="mr-2 text-rose-500">•</span>
                      <span>{point}</span>
                    </li>
                  ))
                ) : (
                   <li className="text-rose-700/50 text-sm italic">Pending bear agent analysis...</li>
                )}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* 4. Final Recommendation */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={recommendation ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          className={`rounded-xl shadow-sm border p-8 text-center transition-colors duration-500 ${
             recommendation === "BUY" ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200" :
             recommendation === "PASS" ? "bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200" :
             "bg-white"
          }`}
        >
          <div className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-4">4. Final Decision</div>
          
          {recommendation ? (
            <>
              <div className={`text-6xl font-black mb-6 ${recommendation === "BUY" ? "text-emerald-600" : "text-rose-600"}`}>
                {recommendation}
              </div>
              <div className="max-w-2xl mx-auto text-gray-700 leading-relaxed bg-white/60 p-4 rounded-lg shadow-sm border border-white/40">
                {state.thesis?.thesis?.replace(/\[RECOMMENDATION:\s*(BUY|PASS)\]/g, "").trim()}
              </div>
            </>
          ) : (
            <div className="text-gray-400 py-8 flex flex-col items-center gap-3">
               <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
               <div>Judge agent is weighing the evidence...</div>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
