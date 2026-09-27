# syntax=docker/dockerfile:1
# Build context: repository root (needs the workspace root + shared package).
ARG NODE_IMAGE=node:24-alpine

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
COPY server server
RUN yarn workspace @presight/server build

# Runtime: the tsup bundle is self-contained, so no node_modules are copied.
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4000 \
    DB_PATH=/app/data/presight.db
WORKDIR /app
COPY --from=build --chown=node:node /app/server/dist ./dist
RUN mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 4000
VOLUME ["/app/data"]
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=5 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" > /dev/null || exit 1
CMD ["node", "--disable-warning=ExperimentalWarning", "--enable-source-maps", "dist/server.js"]
