FROM node:argon

WORKDIR /app/

COPY package.json ./
RUN npm install

COPY bt_data/ ./bt_data/
COPY server.js ./
