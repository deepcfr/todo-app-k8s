FROM oven/bun:1-alpine
WORKDIR /app
RUN apk update && apk upgrade --no-cache && apk add --no-cache dumb-init curl && rm -rf /var/cache/apk/*
RUN addgroup --system --gid 1001 bunjs && \
    adduser --system --uid 1001 meow
COPY --chown=meow:bunjs package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY --chown=meow:bunjs . .
USER meow
EXPOSE 8080
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "src/index.ts"]