FROM node:argon

WORKDIR /app
CMD ["npm", "start"]

COPY package.json ./
RUN npm install

COPY bt_data/ ./bt_data/
COPY server.js ./
