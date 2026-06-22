# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile — ada-web (Next.js docs, Node 22)
# Port: 3002
# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine AS deps
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /build
COPY --from=deps /build/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
RUN apk add --no-cache curl
RUN addgroup -g 1001 -S adaweb && adduser -u 1001 -S adaweb -G adaweb

WORKDIR /app
ENV NODE_ENV=production PORT=3002 HOSTNAME=0.0.0.0

COPY --from=builder --chown=adaweb:adaweb /build/.next/standalone ./
COPY --from=builder --chown=adaweb:adaweb /build/.next/static ./.next/static
COPY --from=builder --chown=adaweb:adaweb /build/public ./public

USER adaweb
EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=20s \
  CMD curl -f http://localhost:3002 || exit 1

CMD ["node", "server.js"]
