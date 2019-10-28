FROM node:10.17.0-alpine

WORKDIR /app/
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["yarn", "start"]
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s CMD curl http://localhost:8344/

RUN echo "http://dl-cdn.alpinelinux.org/alpine/v$(cat /etc/alpine-release | cut -d. -f1-2)/community/" >>/etc/apk/repositories && \
    apk --no-cache add mariadb-client ffmpeg curl && \
    apk --no-cache add --virtual build-dependencies python make g++

COPY package.json ./
RUN npm install && \
    apk --no-cache del build-dependencies

COPY bt_data/ ./bt_data/
COPY modules/ ./modules/
COPY server.js entrypoint.sh ./
