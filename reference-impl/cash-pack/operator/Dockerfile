# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src/ ./src/
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# 1. Create the directory as root
# 2. Change ownership to the 'node' user
RUN mkdir -p /app/keys && chown -R node:node /app/keys
RUN mkdir -p /etc/prometheus/ && chown -R node:node /etc/prometheus/

# Persistent volume for operator key pair
VOLUME ["/app/keys"]

ENV NODE_ENV=production \
    PORT=3000 \
    OPERATOR_ID=cashpack-operator \
    MAX_AMOUNT=1000000 \
    MAX_LIFETIME_DAYS=90 \
    MAX_CHAIN_DEPTH=20 \
    MAX_ACTIVE_PER_PRINCIPAL=10 \
    SUPPORTED_CURRENCIES=USD,EUR,BRL,GBP \
    BASE_URL=http://localhost:3000

EXPOSE 3000

USER node

CMD ["node", "dist/index.js"]
