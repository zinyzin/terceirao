FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

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
