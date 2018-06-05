FROM alpine

VOLUME /var/www/html

WORKDIR /etc/caddy
ENTRYPOINT ["/etc/caddy/entrypoint.sh"]

RUN apk add --no-cache bash ca-certificates && \
    apk add --no-cache --virtual caddy-install-deps gnupg curl && \
    curl https://getcaddy.com | bash -s personal http.realip,tls.dns.cloudflare && \
    apk del --no-cache caddy-install-deps

COPY cloudflare-origin-pull-ca.pem entrypoint.sh Caddyfile /etc/caddy/

RUN caddy -validate
