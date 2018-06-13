FROM php:7.0-fpm-alpine

RUN apk add --no-cache geoip && \
    docker-php-ext-install pdo_mysql mysqli json && \
    mkdir -p /usr/share/GeoIP/ && \
    curl -s "http://geolite.maxmind.com/download/geoip/database/GeoLiteCountry/GeoIP.dat.gz" | gunzip >/usr/share/GeoIP/GeoIP.dat
