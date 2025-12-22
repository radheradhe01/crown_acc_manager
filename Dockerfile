FROM node:20-alpine AS builder
    
WORKDIR /app

# Install all dependencies (including dev) for building
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built server
COPY --from=builder /app/dist ./dist

# Copy built client (public folder inside dist)
COPY --from=builder /app/dist/public ./dist/public

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]