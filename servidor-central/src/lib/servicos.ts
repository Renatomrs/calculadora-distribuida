/**
 * Registro dos microserviços conhecidos pelo SERVIDOR CENTRAL (gateway).
 *
 * O endereço de cada serviço vem de uma variável de ambiente:
 *   - Dentro do Docker, usamos o NOME do serviço da rede (ex.: http://servico-soma:4001).
 *   - Fora do Docker (rodando com `npm run dev`), caímos no localhost.
 */

export type OperacaoId = "soma" | "subtracao" | "multiplicacao" | "divisao";

export interface ServicoInfo {
  id: OperacaoId;
  nome: string;
  simbolo: string;
  url: string;
}

export const SERVICOS: Record<OperacaoId, ServicoInfo> = {
  soma: {
    id: "soma",
    nome: "Soma",
    simbolo: "+",
    url: process.env.SOMA_URL ?? "http://localhost:4001",
  },
  subtracao: {
    id: "subtracao",
    nome: "Subtração",
    simbolo: "−",
    url: process.env.SUBTRACAO_URL ?? "http://localhost:4002",
  },
  multiplicacao: {
    id: "multiplicacao",
    nome: "Multiplicação",
    simbolo: "×",
    url: process.env.MULTIPLICACAO_URL ?? "http://localhost:4003",
  },
  divisao: {
    id: "divisao",
    nome: "Divisão",
    simbolo: "÷",
    url: process.env.DIVISAO_URL ?? "http://localhost:4004",
  },
};

export const IDS_OPERACAO = Object.keys(SERVICOS) as OperacaoId[];

/** Type guard: confirma que a string recebida é uma operação válida. */
export function isOperacao(value: string | null): value is OperacaoId {
  return value !== null && Object.prototype.hasOwnProperty.call(SERVICOS, value);
}

/**
 * `fetch` com timeout. Se o microserviço não responder dentro do prazo, a
 * requisição é abortada — assim o servidor central NUNCA fica travado por
 * causa de um serviço lento ou fora do ar (peça-chave da tolerância a falhas).
 */
export async function fetchComTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
}
