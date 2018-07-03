FROM node:10-alpine

WORKDIR /app/

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.7/community/' >> /etc/apk/repositories && \
    apk update && \
    apk add mariadb-client ffmpeg

COPY package.json ./
RUN npm install

COPY bt_data/ ./bt_data/
COPY entrypoint.sh server.js ./
