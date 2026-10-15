# Stage 1: Compile TypeScript to JavaScript
FROM node:22.23.1-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production runtime environment
FROM node:22.23.1-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy built files from the compilation stage
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["npm", "start"]