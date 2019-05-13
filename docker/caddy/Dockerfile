FROM alpine:3.9.4

WORKDIR /etc/caddy
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s CMD curl http://localhost:1234/ping.txt

ENV CADDY_TELEMETRY=off
RUN apk --no-cache add bash ca-certificates curl && \
    apk --no-cache add --virtual caddy-install-deps gnupg && \
    curl -L https://getcaddy.com | bash -s personal http.realip,tls.dns.cloudflare && \
    apk --no-cache del caddy-install-deps

COPY Caddyfile mimes ./
RUN env \
    DOMAIN=localhost \
    HTTP_PORT=80 \
    HTTPS_PORT=443 \
    LEGACY_SOCKET_PORT=8344 \
    TLS_TYPE=http \
    caddy -validate
