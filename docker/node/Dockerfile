FROM node:10-alpine

WORKDIR /app/
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s CMD curl http://localhost:8344/

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.7/community/' >> /etc/apk/repositories && \
    apk add --no-cache mariadb-client ffmpeg curl && \
    apk add --no-cache --virtual build-dependencies python make g++

COPY package.json ./
RUN npm install && \
    apk del build-dependencies

COPY bt_data/ ./bt_data/
COPY server.js entrypoint.sh ./
