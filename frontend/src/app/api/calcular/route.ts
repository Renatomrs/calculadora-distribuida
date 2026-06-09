import { type NextRequest, NextResponse } from "next/server";

import { CENTRAL_URL } from "@/lib/central";

export const dynamic = "force-dynamic";

/**
 * GET /api/calcular?op=...&a=...&b=...
 *
 * Proxy server-side: repassa a requisição do navegador para o servidor central.
 * Se o PRÓPRIO servidor central estiver fora do ar, devolvemos um erro amigável
 * — o frontend continua no ar (mais uma camada de tolerância a falhas).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  try {
    const r = await fetch(`${CENTRAL_URL}/api/calcular?${searchParams.toString()}`, {
      cache: "no-store",
    });
    const dados = await r.json();
    return NextResponse.json(dados, { status: r.status });
  } catch {
    return NextResponse.json(
      { erro: "Servidor central indisponível no momento.", offline: true },
      { status: 503 },
    );
  }
}
