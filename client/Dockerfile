# syntax=docker/dockerfile:1
# Build context: repository root (needs the workspace root + shared package).
ARG NODE_IMAGE=node:24-alpine
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:stable-alpine

FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json yarn.lock ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --ignore-scripts --network-timeout 600000
COPY tsconfig.base.json ./
COPY shared shared
COPY client client
# Empty = same-origin `/api` (proxied by nginx). Set to call an external API instead.
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN yarn workspace @presight/client build

# Runtime: unprivileged nginx serving static assets and reverse-proxying /api.
FROM ${NGINX_IMAGE} AS runtime
ENV API_UPSTREAM=http://server:4000
COPY client/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8080/healthz > /dev/null || exit 1
