FROM node:10-alpine

WORKDIR /app/

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.7/community/' >> /etc/apk/repositories && \
    apk add --no-cache mariadb-client ffmpeg && \
    apk add --no-cache --virtual build-dependencies python make g++

COPY package.json ./
RUN npm install && \
    apk del build-dependencies

COPY bt_data/ ./bt_data/
COPY entrypoint.sh server.js ./
