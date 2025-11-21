# ---------- Stage 1: Builder ----------
FROM node:18-alpine AS builder
#FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Generate Prisma client for Linux
RUN npx prisma generate

# Build Next.js (Comment out for RUN npm run dev)
RUN npm run build

# ---------- Stage 2: Runner ----------
FROM node:18-alpine AS runner
WORKDIR /app
# ENV NODE_ENV=production

# ADDED: Install Chromium + required libs for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# ADDED: Puppeteer environment variables
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copy package files & install only production deps
COPY package*.json ./
# RUN npm install
RUN npm install --production
# RUN npm install --only=production

# Copy build output and other required files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
#COPY --from=builder /app/node_modules ./node_modules

# Expose container port
EXPOSE 3000

# Run with next start (NOT standalone)
CMD ["npm", "start"]
# CMD ["npm", "run", "dev"]

