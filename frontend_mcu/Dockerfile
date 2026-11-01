# Step 1: Build dengan Bun
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package.json dan bun.lock
COPY package*.json bun.lock ./

# Install dependencies pakai Bun
RUN bun install

# Copy sisa kodingan frontend
COPY . .

# Build Vite project
RUN bun run build

# Step 2: Serve dengan Nginx
FROM nginx:alpine

# Copy hasil build ke folder Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]