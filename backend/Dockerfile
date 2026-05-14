FROM oven/bun:1-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init curl
RUN addgroup --system --gid 1001 bunjs && \
    adduser --system --uid 1001 meow
COPY --chown=meow:bunjs package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY --chown=meow:bunjs . .
USER meow
EXPOSE 8080
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "index.ts"]