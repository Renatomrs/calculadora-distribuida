import { NextResponse } from "next/server";

import { SERVICO } from "@/lib/operacao";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Usado pelo servidor central e pelo healthcheck do Docker para saber se este
 * microserviço está no ar. Responde rápido e sem dependências externas.
 */
export async function GET() {
  return NextResponse.json({
    servico: SERVICO,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
