# build
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# serve using nginx
FROM nginx:stable-alpine

# because we are using envsubst
RUN apk add --no-cache gettext 

COPY --from=builder /app/dist /usr/share/nginx/html
COPY entrypoint.sh /docker-entrypoint.sh   
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]