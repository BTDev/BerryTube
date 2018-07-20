FROM alpine

WORKDIR /etc/caddy
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s CMD curl http://localhost:1234/ping.txt

RUN apk add --no-cache bash ca-certificates curl && \
    apk add --no-cache --virtual caddy-install-deps gnupg && \
    curl -L https://getcaddy.com | bash -s personal http.realip,tls.dns.cloudflare && \
    apk del --no-cache caddy-install-deps

COPY Caddyfile ./
RUN env \
    DOMAIN=localhost \
    CDN_DOMAIN=cdn.localhost \
    SOCKET_DOMAIN=socket.localhost \
    HTTP_PORT=80 \
    HTTPS_PORT=443 \
    LEGACY_SOCKET_PORT=8344 \
    TLS_TYPE=http \
    caddy -validate
