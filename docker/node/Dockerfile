# https://hub.docker.com/_/node
# can't use newer due to python2 requirement
FROM node:16.15.0-alpine

WORKDIR /app/
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["yarn", "start"]
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s CMD curl http://localhost:8344/

RUN echo "https://dl-cdn.alpinelinux.org/alpine/v$(cat /etc/alpine-release | cut -d. -f1-2)/community/" >>/etc/apk/repositories && \
    apk --no-cache add mariadb-client ffmpeg curl && \
    apk --no-cache add --virtual build-dependencies python2 make g++

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && \
    apk --no-cache del build-dependencies

COPY bt_data/ ./bt_data/
COPY modules/ ./modules/
COPY server.js entrypoint.sh ./
