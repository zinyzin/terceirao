FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma (Debian-based has better compatibility)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
RUN npm install --only=production --no-package-lock

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/src ./src/

RUN mkdir -p uploads/students uploads/raffles logs

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node src/seed.js && node src/index.js"]
