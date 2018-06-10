FROM node:argon

WORKDIR /app/

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]

RUN apt-get -y update && \
    apt-get -y install mysql-client && \
    rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

COPY bt_data/ ./bt_data/
COPY entrypoint.sh server.js ./
