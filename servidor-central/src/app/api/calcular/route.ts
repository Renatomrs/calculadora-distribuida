import { type NextRequest, NextResponse } from "next/server";

import { fetchComTimeout, isOperacao, SERVICOS } from "@/lib/servicos";

export const dynamic = "force-dynamic";

// Tempo máximo de espera pela resposta de um microserviço.
const TIMEOUT_MS = 4000;

/**
 * GET /api/calcular?op=soma|subtracao|multiplicacao|divisao&a=NUMERO&b=NUMERO
 *
 * O coração do gateway: valida a requisição, descobre QUAL microserviço deve
 * resolver a conta e repassa a chamada via HTTP. Se o microserviço estiver
 * fora do ar, devolvemos um erro amigável (503) SEM derrubar o servidor central
 * nem os demais serviços — é exatamente isso a tolerância a falhas.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const op = searchParams.get("op");
  const a = searchParams.get("a");
  const b = searchParams.get("b");

  // 1) A operação existe?
  if (!isOperacao(op)) {
    return NextResponse.json(
      { erro: "Operação inválida. Use: soma, subtracao, multiplicacao ou divisao." },
      { status: 400 },
    );
  }

  // 2) Os números são válidos?
  if (a === null || b === null || Number.isNaN(Number(a)) || Number.isNaN(Number(b))) {
    return NextResponse.json({ erro: "Informe dois números válidos." }, { status: 400 });
  }

  const servico = SERVICOS[op];
  const alvo = `${servico.url}/api/operar?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`;

  // 3) Chama o microserviço responsável (com timeout + tratamento de falha).
  try {
    const resposta = await fetchComTimeout(alvo, TIMEOUT_MS);
    const dados = await resposta.json();

    // O serviço respondeu, mas com erro de regra (ex.: divisão por zero).
    if (!resposta.ok) {
      return NextResponse.json(
        { erro: dados.erro ?? "Erro ao processar a operação." },
        { status: resposta.status },
      );
    }

    // Sucesso: repassa o resultado para quem chamou.
    return NextResponse.json(dados);
  } catch {
    // Timeout ou serviço inacessível => este serviço está offline.
    return NextResponse.json(
      {
        erro: `Serviço de ${servico.nome} indisponível no momento.`,
        offline: true,
        servico: op,
      },
      { status: 503 },
    );
  }
}
