FROM alpine

VOLUME /var/www/html
WORKDIR /etc/caddy

RUN apk add --no-cache bash ca-certificates && \
    apk add --no-cache --virtual caddy-install-deps gnupg curl && \
    curl https://getcaddy.com | bash -s personal && \
    apk del --no-cache caddy-install-deps

COPY Caddyfile ./
RUN env \
    DOMAIN=localhost \
    HTTP_PORT=80 \
    HTTPS_PORT=443 \
    NODE_HTTP_PORT=8344 \
    NODE_HTTPS_PORT=8443 \
    caddy -validate
