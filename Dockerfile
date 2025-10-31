# Multi-stage build para menor tamaño final
FROM node:20-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml tsoa.json ./
COPY tsconfig.json ./

# Instalar todas las dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY src/ ./src/

# Generar Swagger y compilar
RUN pnpm run build

# Instalar solo dependencias de producción
RUN pnpm prune --prod

# Stage final - imagen mínima
FROM node:20-alpine AS runner

# Instalar CA certificates
RUN apk add --no-cache ca-certificates

# Copiar certificado personalizado
COPY chain.pem /tmp/chain.pem
RUN cp /tmp/chain.pem /usr/local/share/ca-certificates/ufps.crt && \
    update-ca-certificates && \
    # También crear el archivo para NODE_EXTRA_CA_CERTS
    cp /tmp/chain.pem /etc/ssl/certs/ufps-chain.pem

WORKDIR /app

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copiar archivos compilados y dependencias desde builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

USER nodejs

ENV NODE_ENV=production
ENV PORT=8080
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ufps-chain.pem

EXPOSE 8080

CMD ["node", "dist/index.js"]