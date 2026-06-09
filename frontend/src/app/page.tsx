"use client";

import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type OpId = "soma" | "subtracao" | "multiplicacao" | "divisao";

interface Operacao {
  id: OpId;
  simbolo: string;
  nome: string;
  porta: number;
}

interface ResultadoOk {
  servico: string;
  operacao: string;
  a: number;
  b: number;
  resultado: number;
}

interface ResultadoErro {
  erro: string;
  offline?: boolean;
  servico?: string;
}

type StatusServicos = Partial<Record<OpId, boolean>> & { central?: boolean };

// ---------------------------------------------------------------------------
// Configuração das operações (id = nome do microserviço)
// ---------------------------------------------------------------------------
const OPERACOES: Operacao[] = [
  { id: "soma", simbolo: "+", nome: "Soma", porta: 4001 },
  { id: "subtracao", simbolo: "−", nome: "Subtração", porta: 4002 },
  { id: "multiplicacao", simbolo: "×", nome: "Multiplicação", porta: 4003 },
  { id: "divisao", simbolo: "÷", nome: "Divisão", porta: 4004 },
];

// Evita dízimas gigantes (ex.: 10 ÷ 3).
function formatar(n: number): string {
  if (typeof n !== "number" || Number.isNaN(n)) return String(n);
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(6)).toString();
}

export default function Home() {
  const [a, setA] = useState("10");
  const [b, setB] = useState("5");
  const [op, setOp] = useState<OpId>("soma");
  const [resultado, setResultado] = useState<ResultadoOk | null>(null);
  const [erro, setErro] = useState<ResultadoErro | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [status, setStatus] = useState<StatusServicos>({});

  // Monitora o status dos serviços a cada 3 segundos.
  const carregarStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/status", { cache: "no-store" });
      setStatus((await r.json()) as StatusServicos);
    } catch {
      setStatus({});
    }
  }, []);

  useEffect(() => {
    // Busca inicial + atualização a cada 3s (sincroniza a UI com a API de
    // status). O setState só ocorre após o fetch, dentro do callback assíncrono.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarStatus();
    const id = setInterval(carregarStatus, 3000);
    return () => clearInterval(id);
  }, [carregarStatus]);

  async function calcular() {
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      const url = `/api/calcular?op=${op}&a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`;
      const r = await fetch(url, { cache: "no-store" });
      const dados = await r.json();
      if (!r.ok) setErro(dados as ResultadoErro);
      else setResultado(dados as ResultadoOk);
    } catch {
      setErro({ erro: "Não foi possível contatar o servidor central.", offline: true });
    } finally {
      setCarregando(false);
    }
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") calcular();
  }

  const opAtual = OPERACOES.find((o) => o.id === op)!;
  const centralOnline = status.central !== false && Object.keys(status).length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* brilhos de fundo */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-[320px] w-[320px] rounded-full bg-sky-300/20 blur-3xl" />

      <main className="relative mx-auto max-w-3xl px-5 py-12 sm:py-16">
        {/* Cabeçalho */}
        <header className="mb-8">
          <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Sistemas Distribuídos · A3
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Calculadora Distribuída
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-600">
            Cada operação roda em um microserviço independente, em seu próprio container
            Docker. Se um serviço cair, os demais continuam funcionando normalmente.
          </p>
        </header>

        {/* Painel de arquitetura / status */}
        <section
          aria-label="Status dos serviços"
          className="mb-6 rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold ${
                centralOnline
                  ? "bg-slate-900 text-slate-100"
                  : "bg-red-100 text-red-700 ring-1 ring-red-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${centralOnline ? "bg-sky-400" : "bg-red-500"}`}
              />
              Servidor Central · :4000 {centralOnline ? "" : "(offline)"}
            </span>
            <span className="text-xs text-slate-400">monitorando a cada 3s</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {OPERACOES.map((o) => {
              const online = status[o.id] === true;
              return (
                <div
                  key={o.id}
                  className={`rounded-xl border p-3.5 transition-colors ${
                    online
                      ? "border-emerald-200 bg-emerald-50/70"
                      : "border-red-200 bg-red-50/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {online && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                          online ? "bg-emerald-500" : "bg-red-400"
                        }`}
                      />
                    </span>
                    <span className="text-sm font-bold text-slate-800">{o.nome}</span>
                  </div>
                  <div className="mt-1 font-mono text-xs text-slate-500">:{o.porta}</div>
                  <div
                    className={`mt-1 text-xs font-semibold ${
                      online ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {online ? "online" : "offline"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Calculadora */}
        <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7">
          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <label htmlFor="a" className="mb-1.5 block text-xs uppercase tracking-wide text-slate-500">
                Número A
              </label>
              <input
                id="a"
                type="number"
                value={a}
                onChange={(e) => setA(e.target.value)}
                onKeyDown={aoTeclar}
                className="w-full rounded-xl border-[1.5px] border-slate-200 bg-slate-50 px-3 py-3 text-center font-mono text-2xl text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <div className="-my-1 text-center font-mono text-2xl font-bold text-indigo-500 sm:my-0 sm:pb-3 sm:text-3xl">
              {opAtual.simbolo}
            </div>
            <div>
              <label htmlFor="b" className="mb-1.5 block text-xs uppercase tracking-wide text-slate-500">
                Número B
              </label>
              <input
                id="b"
                type="number"
                value={b}
                onChange={(e) => setB(e.target.value)}
                onKeyDown={aoTeclar}
                className="w-full rounded-xl border-[1.5px] border-slate-200 bg-slate-50 px-3 py-3 text-center font-mono text-2xl text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Botões de operação */}
          <div role="group" aria-label="Escolha a operação" className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {OPERACOES.map((o) => {
              const ativo = op === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => setOp(o.id)}
                  className={`rounded-xl border-[1.5px] px-2 py-3 text-center transition ${
                    ativo
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:border-indigo-400"
                  }`}
                >
                  <span className="block font-mono text-xl font-bold leading-none">{o.simbolo}</span>
                  <span
                    className={`mt-1.5 block text-[11px] font-semibold uppercase tracking-wide ${
                      ativo ? "text-indigo-100" : "text-slate-500"
                    }`}
                  >
                    {o.nome}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={calcular}
            disabled={carregando}
            className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-base font-bold text-white transition hover:bg-indigo-500 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? "Calculando…" : "Calcular"}
          </button>

          {/* Resultado / Erro */}
          <div aria-live="polite" className="mt-6 min-h-[80px] border-t border-dashed border-slate-200 pt-6">
            {erro && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800">
                <span aria-hidden className="text-lg leading-tight">
                  ⚠️
                </span>
                <span>
                  <strong className="block">{erro.erro}</strong>
                  {erro.offline && (
                    <span className="mt-0.5 block text-sm text-red-600">
                      O container deste serviço está parado — mas a calculadora continua no ar.
                    </span>
                  )}
                </span>
              </div>
            )}

            {resultado && !erro && (
              <div>
                <div className="font-mono text-sm text-slate-500">
                  {formatar(resultado.a)} {resultado.operacao} {formatar(resultado.b)} =
                </div>
                <div className="break-all font-mono text-5xl font-extrabold leading-none tracking-tight text-slate-900 sm:text-6xl">
                  {formatar(resultado.resultado)}
                </div>
                <div className="mt-2.5 font-mono text-xs text-slate-400">
                  processado pelo microserviço “{resultado.servico}”
                </div>
              </div>
            )}

            {!resultado && !erro && (
              <p className="text-slate-400">O resultado aparecerá aqui.</p>
            )}
          </div>
        </section>

        <p className="mt-7 text-center font-mono text-xs text-slate-400">
          navegador → frontend → servidor central (gateway) → microserviço · via HTTP
        </p>
      </main>
    </div>
  );
}
