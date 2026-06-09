import { NextResponse } from "next/server";

import { SERVICOS } from "@/lib/servicos";

export const dynamic = "force-dynamic";

/**
 * GET /
 *
 * Página-raiz do servidor central (em JSON). Mostra o papel do serviço e quais
 * microserviços ele orquestra.
 */
export async function GET() {
  return NextResponse.json({
    servidor: "central",
    papel: "gateway / orquestrador",
    microservicos: Object.values(SERVICOS).map((s) => ({
      id: s.id,
      nome: s.nome,
      simbolo: s.simbolo,
      url: s.url,
    })),
    endpoints: {
      calcular: "/api/calcular?op=soma|subtracao|multiplicacao|divisao&a=NUMERO&b=NUMERO",
      status: "/api/status",
    },
  });
}
