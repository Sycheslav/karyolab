# syntax=docker/dockerfile:1.6
#
# Корневой Dockerfile для деплоя через Railway / любой PaaS, который
# использует репозиторий karyolab_v2 как контекст сборки.
# Сам фронтенд лежит в подпапке frontend/, поэтому COPY ссылается туда.

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY frontend/ ./

RUN npm run build


# ---------- Stage 2: runtime ----------
FROM nginx:1.27-alpine AS runtime

RUN apk add --no-cache gettext

COPY --from=builder /app/dist /usr/share/nginx/html

COPY frontend/nginx.conf.template /etc/nginx/templates/default.conf.template

ENV PORT=8080
EXPOSE 8080

# Railway подставляет $PORT уже в рантайме, поэтому рендерим конфиг nginx
# из шаблона прямо при старте контейнера.
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
