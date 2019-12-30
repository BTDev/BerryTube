FROM php:7.3.13-fpm-alpine

RUN docker-php-ext-install pdo_mysql mysqli json && \
    curl -SsL "https://github.com/adoy/PHP-FastCGI-Client/archive/master.zip" >/tmp/fcgi-client.zip && \
    mkdir -p /opt/ && \
    unzip /tmp/fcgi-client.zip -d /opt/ && \
    rm -f /tmp/fcgi-client.zip && \
    mkdir -p /usr/local/share/GeoIP/ && \
    curl -SsL "https://geolite.maxmind.com/download/geoip/database/GeoLite2-Country.tar.gz" | tar xvz --strip-components=1 -C /usr/local/share/GeoIP/

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s CMD test "$(/opt/PHP-FastCGI-Client-master/fcgiget.php localhost:9000/ping | tail -n1)" = pong
COPY php-fpm.ini /usr/local/etc/php-fpm.d/zzz-berrytube.conf
COPY php.ini /usr/local/etc/php/conf.d/zzz-berrytube.ini
RUN php-fpm -t
