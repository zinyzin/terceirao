FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm install --only=production --no-package-lock

# Copy prisma and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source
COPY src ./src/

# Create necessary directories
RUN mkdir -p uploads/students uploads/raffles logs

EXPOSE 3001

# Run migrations + seed + start
CMD ["sh", "-c", "npx prisma migrate deploy && node src/seed.js && node src/index.js"]
