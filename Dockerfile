FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/src ./src/

RUN mkdir -p uploads/students uploads/raffles logs

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node src/seed.js && node src/index.js"]
