import { NextResponse } from "next/server";

import { PORTA, SERVICO, SIMBOLO } from "@/lib/operacao";

export const dynamic = "force-dynamic";

/**
 * GET /
 *
 * Página-raiz do microserviço (em JSON). Útil para confirmar rapidamente, pelo
 * navegador, que o container está vivo e qual operação ele resolve.
 */
export async function GET() {
  return NextResponse.json({
    servico: SERVICO,
    simbolo: SIMBOLO,
    porta: PORTA,
    mensagem: `Microserviço de "${SERVICO}" no ar.`,
    endpoints: {
      operar: "/api/operar?a=NUMERO&b=NUMERO",
      health: "/api/health",
    },
  });
}
