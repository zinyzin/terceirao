# ── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:20-slim AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install --no-package-lock

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Backend + serve frontend ────────────────────────────────────────
FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --only=production --no-package-lock

# Generate Prisma client
COPY backend/prisma ./prisma/
RUN npx prisma generate

# Copy backend source
COPY backend/src ./src/

# Copy built frontend into expected location (backend serves from ../../frontend/dist)
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Create necessary directories
RUN mkdir -p uploads/students uploads/raffles logs

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node src/seed.js && node src/index.js"]
