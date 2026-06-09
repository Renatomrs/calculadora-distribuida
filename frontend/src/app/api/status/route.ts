import { NextResponse } from "next/server";

import { CENTRAL_URL } from "@/lib/central";

export const dynamic = "force-dynamic";

/**
 * GET /api/status
 *
 * Proxy server-side do status. Acrescenta o campo `central` para que a interface
 * também saiba se o servidor central está acessível.
 */
export async function GET() {
  try {
    const r = await fetch(`${CENTRAL_URL}/api/status`, { cache: "no-store" });
    const dados = await r.json();
    return NextResponse.json({ ...dados, central: true }, { status: r.status });
  } catch {
    return NextResponse.json(
      { soma: false, subtracao: false, multiplicacao: false, divisao: false, central: false },
      { status: 503 },
    );
  }
}
