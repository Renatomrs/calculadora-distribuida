/**
 * Endereço do SERVIDOR CENTRAL.
 *
 * O navegador nunca fala direto com o servidor central nem com os microserviços:
 * ele chama apenas as rotas /api deste próprio frontend, que repassam a chamada
 * (server-side) para o servidor central. Isso evita CORS e mantém os endereços
 * internos do Docker realmente internos.
 *
 *   - Dentro do Docker: http://servidor-central:4000 (nome da rede).
 *   - Rodando local:    http://localhost:4000.
 */
export const CENTRAL_URL = process.env.CENTRAL_URL ?? "http://localhost:4000";
