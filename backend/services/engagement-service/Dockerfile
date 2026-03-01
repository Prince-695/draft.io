FROM oven/bun:1.1-alpine
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production=false
COPY . .
EXPOSE 5004
CMD ["bun", "src/index.ts"]
