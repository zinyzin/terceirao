FROM node:20-alpine

WORKDIR /app

# Install OpenSSL and libssl1.1-compat for Prisma
RUN apk add --no-cache openssl libssl1.1-compat

COPY backend/package*.json ./
RUN npm install --only=production --no-package-lock

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/src ./src/

RUN mkdir -p uploads/students uploads/raffles logs

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node src/seed.js && node src/index.js"]
