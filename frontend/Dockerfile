# ----------------------------------------------------------------------------
# Dockerfile (multi-stage) para uma app Next.js 16 com saída "standalone".
# Idêntico para todos os serviços: a PORTA é definida pelo docker-compose.
# ----------------------------------------------------------------------------

# ---- Base: Node 22 LTS enxuto ----
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat

# ---- Dependências ----
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
# Garante que as pastas existam mesmo em apps somente-API (sem 'public').
RUN mkdir -p public .next/static

# ---- Imagem final (somente o necessário para rodar) ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
# Porta padrão; o docker-compose sobrescreve com a porta de cada serviço.
ENV PORT=3000

# Usuário sem privilégios (boa prática de segurança).
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
