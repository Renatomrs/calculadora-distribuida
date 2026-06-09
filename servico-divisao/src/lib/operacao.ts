/**
 * Microserviço de DIVISÃO.
 *
 * Cada microserviço conhece apenas a SUA operação. Esta é a única peça de
 * lógica de negócio do serviço — o resto (HTTP, validação) é genérico.
 *
 * A divisão por zero é tratada aqui: lançamos um erro que a rota converte
 * em uma resposta HTTP 400 amigável.
 */
export const SERVICO = "divisao" as const;
export const SIMBOLO = "÷";
export const PORTA = 4004;

export function operar(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Não é possível dividir por zero.");
  }
  return a / b;
}
