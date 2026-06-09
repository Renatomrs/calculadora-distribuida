/**
 * Microserviço de SOMA.
 *
 * Cada microserviço conhece apenas a SUA operação. Esta é a única peça de
 * lógica de negócio do serviço — o resto (HTTP, validação) é genérico.
 */
export const SERVICO = "soma" as const;
export const SIMBOLO = "+";
export const PORTA = 4001;

export function operar(a: number, b: number): number {
  return a + b;
}
