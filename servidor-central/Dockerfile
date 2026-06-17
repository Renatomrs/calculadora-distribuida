# ----------------------------------------------------------------------------
# Dockerfile (multi-stage) — Servidor Central (Next.js 16, saída "standalone").
# Porta FIXA: 4000
# ----------------------------------------------------------------------------

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
RUN mkdir -p public .next/static

# ---- Imagem final ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=4000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 4000
CMD ["node", "server.js"]
