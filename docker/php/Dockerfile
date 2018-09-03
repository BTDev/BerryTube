FROM php:7-fpm-alpine

RUN apk add --no-cache geoip && \
    docker-php-ext-install pdo_mysql mysqli json && \
    curl -L "https://github.com/adoy/PHP-FastCGI-Client/archive/master.zip" >/tmp/fcgi-client.zip && \
    mkdir -p /opt/ && \
    unzip /tmp/fcgi-client.zip -d /opt/ && \
    rm -f /tmp/fcgi-client.zip && \
    mkdir -p /usr/share/GeoIP/ && \
    curl -L "http://geolite.maxmind.com/download/geoip/database/GeoLiteCountry/GeoIP.dat.gz" | gunzip >/usr/share/GeoIP/GeoIP.dat

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s CMD test "$(/opt/PHP-FastCGI-Client-master/fcgiget.php localhost:9000/ping | tail -n1)" = pong
COPY php-fpm.ini /usr/local/etc/php-fpm.d/zzz-berrytube.conf
COPY php.ini /usr/local/etc/php/conf.d/zzz-berrytube.ini
RUN php-fpm -t
