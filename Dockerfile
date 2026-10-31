# Image de production de Sheet Explorer (Next.js en mode standalone).
#
# Variables :
#   GOOGLE_SHEETS_API_KEY  lue à l'exécution (variable d'environnement du conteneur).
#   SHEETS_DEMO_MODE=true  à l'exécution, pour servir les bases de démonstration.
#   WHATSAPP_NUMBER        lue à la construction (la landing est une page statique) :
#                          à déclarer comme variable de build (build arg).

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. Dépendances
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 2. Construction
FROM base AS builder
ARG WHATSAPP_NUMBER
ENV WHATSAPP_NUMBER=${WHATSAPP_NUMBER}
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Exécution
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Les CSV de démonstration sont lus par /api/sheets (bases « demo-… »).
COPY --from=builder --chown=nextjs:nodejs /app/sample-data ./sample-data

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
