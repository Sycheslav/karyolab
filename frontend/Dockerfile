# syntax=docker/dockerfile:1.6

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

RUN npm run build


# ---------- Stage 2: runtime ----------
FROM nginx:1.27-alpine AS runtime

RUN apk add --no-cache gettext

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

ENV PORT=8080
EXPOSE 8080

# Render the nginx template against $PORT and start nginx in the foreground.
# nginx:alpine's entrypoint already substitutes /etc/nginx/templates/*.template,
# but we keep the explicit envsubst to be safe in non-default configurations
# (e.g. Railway sets PORT only at runtime).
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
