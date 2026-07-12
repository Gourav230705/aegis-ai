import { NextRequest, NextResponse } from "next/server";
import { CompanyResearchInputSchema } from "../../../lib/validation";
import { rateLimit } from "../../../lib/rateLimit";
import { getLogger } from "../../../lib/logger";
import { aegisResearchGraph } from "../../../agents/graph";
import { Company } from "../../../types/domain";

export async function POST(req: NextRequest) {
  const requestId = "REQ-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
  const log = getLogger(requestId);

  log.info("Received research request");

  // Basic IP-based rate limiting (fallback to generic if IP not found)
  const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
  if (!rateLimit(ip)) {
    log.warn({ ip }, "Rate limit exceeded");
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    
    // Zod validation
    const parsed = CompanyResearchInputSchema.safeParse(body);
    if (!parsed.success) {
      log.warn({ errors: parsed.error.format() }, "Invalid input payload");
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const inputData = parsed.data;

    // Prepare initial graph state
    const company: Company = {
      name: inputData.companyName,
      ticker: inputData.ticker || "UNKNOWN",
    };

    const initialState = {
      company,
      manifest: null,
      thesis: null,
      plan: [],
      status: "INIT",
      verificationWarnings: [],
      judgeCitations: [],
    };

    log.info({ company }, "Starting LangGraph sequence");

    // Create readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          // Stream from LangGraph
          const eventStream = await aegisResearchGraph.stream(initialState);
          
          for await (const chunk of eventStream) {
            // chunk is an object with node names as keys and the updated state as values
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          }
          
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          log.info("LangGraph sequence completed successfully");
        } catch (error) {
          log.error({ error }, "Error during LangGraph execution");
          // Send an error event to the client before closing
          controller.enqueue(encoder.encode(`data: {"error": "Internal server error during processing"}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    log.error({ error }, "Unhandled exception in API route");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
