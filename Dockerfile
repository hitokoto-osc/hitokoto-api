# The base image is the latest 8.x node (LTS)
FROM node:8.9.0

# Init Runtime
ADD . /app/
WORKDIR /app

# Mount VOLUME
VOLUME /hitokoto
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

RUN npm i pnpm -g
RUN pnpm install --force

ENV NODE_ENV=production \
    daemon=false \
    silent=false \
    CONFIG_FILE=""

CMD node core.js --config_path "$CONFIG_FILE"

# the default port for Teng-koa is exposed outside the container
EXPOSE 8000
