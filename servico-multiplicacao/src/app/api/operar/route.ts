import { type NextRequest, NextResponse } from "next/server";

import { operar, SERVICO, SIMBOLO } from "@/lib/operacao";

// Cada cálculo é processado na hora (Route Handlers não são cacheados por
// padrão no Next.js 16; deixamos explícito para evitar qualquer cache).
export const dynamic = "force-dynamic";

/**
 * GET /api/operar?a=NUMERO&b=NUMERO
 *
 * Endpoint público deste microserviço. Recebe dois números, aplica APENAS a
 * operação deste serviço e devolve o resultado em JSON.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const aParam = searchParams.get("a");
  const bParam = searchParams.get("b");
  const a = Number(aParam);
  const b = Number(bParam);

  // Validação: os dois parâmetros precisam ser números válidos.
  if (aParam === null || bParam === null || Number.isNaN(a) || Number.isNaN(b)) {
    return NextResponse.json(
      { erro: "Parâmetros inválidos. Use ?a=NUMERO&b=NUMERO" },
      { status: 400 },
    );
  }

  try {
    const resultado = operar(a, b);
    return NextResponse.json({ servico: SERVICO, operacao: SIMBOLO, a, b, resultado });
  } catch (e) {
    // Regras de negócio (ex.: divisão por zero) viram um 400 amigável.
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Erro ao processar a operação." },
      { status: 400 },
    );
  }
}
