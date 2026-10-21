# https://hub.docker.com/_/php
FROM php:8.1.34-fpm-alpine

ARG MAXMIND_KEY

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s CMD /usr/local/bin/php-fpm-healthcheck

# fcgi needed for the PHP healthcheck above
# ffmpeg needed for extracting video information in manifest.php
RUN apk add --no-cache fcgi ffmpeg

RUN docker-php-ext-install pdo_mysql mysqli && \
    curl -SsL https://github.com/renatomefi/php-fpm-healthcheck/raw/refs/tags/v0.6.0/php-fpm-healthcheck >/usr/local/bin/php-fpm-healthcheck  && \
    chmod +x /usr/local/bin/php-fpm-healthcheck && \
    mkdir -p /usr/local/share/GeoIP/ && \
    if [ -n "$MAXMIND_KEY" ]; then curl -SsL "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&suffix=tar.gz&license_key=$MAXMIND_KEY" | tar xvz --strip-components=1 -C /usr/local/share/GeoIP/; fi

COPY php-fpm.ini /usr/local/etc/php-fpm.d/zzz-berrytube.conf
COPY php.ini /usr/local/etc/php/conf.d/zzz-berrytube.ini
RUN php-fpm -t
