import { NextResponse } from "next/server";

import { fetchComTimeout, IDS_OPERACAO, type OperacaoId, SERVICOS } from "@/lib/servicos";

export const dynamic = "force-dynamic";

// Healthcheck precisa ser rápido: timeout curto.
const TIMEOUT_MS = 2000;

/**
 * GET /api/status
 *
 * Pergunta a cada microserviço (em paralelo) se ele está vivo, via /api/health.
 * Responde algo como: { "soma": true, "subtracao": false, ... }
 *
 * Como cada chamada tem seu próprio try/catch, um serviço offline vira apenas
 * `false` — nunca um erro que derrube esta rota.
 */
export async function GET() {
  const entradas = await Promise.all(
    IDS_OPERACAO.map(async (id): Promise<readonly [OperacaoId, boolean]> => {
      try {
        const r = await fetchComTimeout(`${SERVICOS[id].url}/api/health`, TIMEOUT_MS);
        return [id, r.ok] as const;
      } catch {
        return [id, false] as const;
      }
    }),
  );

  const status = Object.fromEntries(entradas) as Record<OperacaoId, boolean>;
  return NextResponse.json(status);
}
